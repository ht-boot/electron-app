import React, { useMemo, useState, useEffect, useRef, memo } from 'react'
import { message } from 'antd'
import useAudioTime from '../../hooks/useAudioTime'
import createAudio from '../../utils/createAudio'
import { updateMusicCurrentTime, updateMusicCurrentPlay } from '../../store/baseSlice/base'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@renderer/store'
import EVTheme from '../../components/theme'
import styles from './index.module.less'

const AudioPlayer = (): React.JSX.Element => {
  const data = useSelector((state: RootState) => state.base.musicList)
  const musicCurrentPlay = useSelector((state: RootState) => state.base.musicCurrentPlay)
  const dispatch = useDispatch<AppDispatch>()

  const [messageApi, contextHolder] = message.useMessage()

  // 创建 Audio 对象, 进行函数缓存， 避免组件更新重复创建audio
  const audio = useMemo(() => createAudio(data[musicCurrentPlay]?.url), [])

  // 自定义Hook获取音频的当前时间和总时长
  const { currentTime: musicCurrentTime, totalTime: musicTotalTime } = useAudioTime(
    audio as HTMLAudioElement
  )

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false)
  // 播放/暂停
  const handleTogglePlay = (): void => {
    if (!audio) return
    setIsPlaying(!isPlaying)
    // 检查音频是否暂停,如果暂停，则播放, 正在播放，则暂停
    audio.paused ? audio.play() : audio.pause()
  }

  // 播放进度条
  const progressRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!audio) return
    // 更新进度条
    const updateProgress = (): void => {
      if (audio && !audio.paused) {
        setProgress((audio.currentTime / audio.duration) * 100)
        // 实时传递当前播放时间到 Redux store
        dispatch(updateMusicCurrentTime(audio.currentTime))
      }
    }

    // 更新播放状态
    const handleEnded = (): void => {
      setIsPlaying(false)
    }

    // 监听音频播放进度，更新进度条
    audio.addEventListener('timeupdate', updateProgress)
    // 监听音频播放完毕事件，更新播放状态
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audio])

  // 点击/拖拽进度条，设置播放进度
  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault()

    if (!progressRef.current) return

    // 获取进度条的宽度
    const { width, left } = progressRef.current.getBoundingClientRect()
    // 计算点击位置的比例
    const pos = (e.clientX - left) / width

    // 更新音频进度
    if (audio) {
      audio.currentTime = pos * audio.duration
      setProgress(pos * 100)
    }
    // 添加全局事件监听器
    const handleMouseMove = (moveEvent: MouseEvent): void => {
      // 计算移动位置的比例，可能为负数
      const movePos = (moveEvent.clientX - left) / width
      // 限制在0-1范围内（处理负数的可能）
      const pos = Math.max(0, Math.min(1, movePos))
      // 重新更新音频进度
      if (audio) {
        audio.currentTime = pos * audio.duration
        setProgress(pos * 100)
      }
      console.log('move')
    }

    const handleMouseUp = (): void => {
      // 移除事件监听器
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // 添加事件监听器
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // 播放音频
    if (audio && audio.paused) {
      audio.play()
      setIsPlaying(true)
    }
  }

  // 重置音频
  const handleResetAudio = () => {
    audio.pause()
    setIsPlaying(false)
    setProgress(0)
    dispatch(updateMusicCurrentTime(0))
  }

  // 切换歌曲 下一首/上一首
  const handleSwitchMusic = (type: 'next' | 'prev', number: number): void => {
    messageApi.open({
      type: 'success',
      content: 'Action in progress..',
      duration: 2.5
    })

    if (!audio) return
    handleResetAudio() // 重置音频
    if (type === 'next') {
      if (musicCurrentPlay < data.length - 1) {
        dispatch(updateMusicCurrentPlay(musicCurrentPlay + number))
      } else {
        messageApi.open({
          type: 'success',
          content: 'Action in progress..',
          duration: 2.5
        })
      }
    } else {
      if (musicCurrentPlay > 0) {
        dispatch(updateMusicCurrentPlay(musicCurrentPlay + number))
      } else {
        messageApi.open({
          type: 'success',
          content: 'Action in progress..',
          duration: 2.5
        })
      }
    }
    audio.src = data[musicCurrentPlay + number].url
  }

  return (
    <>
      <div className={styles.audioPlayerControls}>
        <div className={styles.icons}>
          {contextHolder}
          <i
            className={`iconfont icon-shangyige ${styles.iconNext}`}
            onClick={() => {
              handleSwitchMusic('prev', -1)
            }}
          ></i>
          <i
            className={`iconfont ${isPlaying ? 'icon-zanting' : 'icon-icon_play'} ${styles.iconPlay}`}
            onClick={() => handleTogglePlay()}
          ></i>
          <i
            className={`iconfont icon-xiayige ${styles.iconLast}`}
            onClick={() => {
              handleSwitchMusic('next', 1)
            }}
          ></i>
        </div>
        <div className={styles.audioPlayerProgressBar}>
          <div className={styles.infoTime}>
            <div className={styles.songInfo}>
              <span className={styles.songName}>{data[musicCurrentPlay].title}</span> -{' '}
              <span className={styles.singer}>{data[musicCurrentPlay].author}</span>
            </div>
            <div className={styles.time}>
              <span className={styles.currentTime}>{musicCurrentTime}</span> /{' '}
              <span className={styles.totalTime}>{musicTotalTime}</span>
            </div>
          </div>
          <div
            ref={progressRef}
            className={styles.progressBar}
            onMouseDown={(e) => handleProgressDrag(e)}
          >
            <div className={styles.progress} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className={styles.audioPlayerLeft}>
          <i className="iconfont icon-ziyuan icon" onClick={() => {}}></i>
          <i className="iconfont icon-shengyin icon" onClick={() => {}}></i>
          <i className="iconfont icon-caidan icon" onClick={() => {}}></i>
          <EVTheme />
        </div>
      </div>
    </>
  )
}

export default memo(AudioPlayer)
