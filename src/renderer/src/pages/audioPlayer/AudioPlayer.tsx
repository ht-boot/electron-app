import React, { useMemo, useState, useEffect, useRef, memo } from 'react'
import useAudioTime from '../../hooks/useAudioTime'
import createAudio from '../../utils/createAudio'
import { Popover } from 'antd'
import { MoonOutlined, RedoOutlined, SunOutlined } from '@ant-design/icons'
import { updateMusicCurrentTime, updateMusicCurrentPlay } from '../../store/baseSlice/base'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@renderer/store'
import styles from './index.module.less'
const AudioPlayer = (): React.JSX.Element => {
  const { data } = useSelector((state: RootState) => state.base.musicList)
  const musicCurrentPlay = useSelector((state: RootState) => state.base.musicCurrentPlay)
  const dispatch = useDispatch<AppDispatch>()

  // 创建 Audio 对象, 进行函数缓存， 避免组件更新重复创建audio
  const audio = useMemo(() => createAudio(data[musicCurrentPlay].url), [])

  const [theme, setTheme] = useState<string>('light')

  const options = (
    <div className={styles.options}>
      <p
        className={`${styles.checkTheme} ${theme == 'system' ? styles.active : ''}`}
        onClick={(_e) => handleChangeTheme('system', _e)}
      >
        跟随系统
        <RedoOutlined style={{ marginLeft: '10px' }} />
      </p>
      <p
        className={`${styles.checkTheme} ${theme == 'light' ? styles.active : ''}`}
        onClick={(_e) => handleChangeTheme('light', _e)}
      >
        浅色主题
        <SunOutlined style={{ marginLeft: '10px' }} />
      </p>
      <p
        className={`${styles.checkTheme} ${theme == 'dark' ? styles.active : ''}`}
        onClick={(_e) => handleChangeTheme('dark', _e)}
      >
        暗色主题
        <MoonOutlined style={{ marginLeft: '10px' }} />
      </p>
    </div>
  )

  // 跟随系统切换主题
  const symtemTheme = (): void => {
    const bodyEl = document.body
    bodyEl.style.backgroundImage = `url(${data[0].pic})`
    bodyEl.style.backgroundSize = 'cover'
    bodyEl.style.backgroundRepeat = 'no-repeat'
    bodyEl.style.backgroundPosition = 'center'
    bodyEl.style.backdropFilter = 'blur(50px)'
    document.documentElement.setAttribute('data-theme', 'dark')
  }
  const lightTheme = (value: string): void => {
    document.body.style.backgroundImage = 'none'
    document.documentElement.setAttribute('data-theme', value == 'light' ? 'light' : 'dark')
  }

  // 切换主题
  const handleChangeTheme = (
    value: string,
    _e: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ): void => {
    setTheme(value)
    const transitionAnimation = document.startViewTransition(() => {
      value === 'system' ? symtemTheme() : lightTheme(value)
    })
    transitionAnimation.ready.then(() => {
      //先获取到鼠标的位置
      const { clientX, clientY } = _e
      // 计算半径，以鼠标点击的位置为圆心，到四个角的距离中最大的那个作为半径
      const radius = Math.hypot(
        Math.max(clientX, window.innerWidth - clientX),
        Math.max(clientY, window.innerHeight - clientY)
      )
      // 自定义动画
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0% at ${clientX}px ${clientY}px)`,
            `circle(${radius}px at ${clientX}px ${clientY}px)`
          ]
        },
        {
          duration: 500,
          pseudoElement: '::view-transition-new(root)'
        }
      )
    })
  }

  // 自定义Hook获取音频的当前时间和总时长
  const { currentTime: musicCurrentTime, totalTime: musicTotalTime } = useAudioTime(audio)

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false)
  // 播放/暂停
  const handleTogglePlay = (): void => {
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
    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    }
  }

  return (
    <>
      <div className={styles.audioPlayerControls}>
        <div className={styles.icons}>
          <i className={`iconfont icon-shangyige ${styles.iconNext}`} onClick={() => {}}></i>
          <i
            className={`iconfont ${isPlaying ? 'icon-zanting' : 'icon-icon_play'} ${styles.iconPlay}`}
            onClick={() => handleTogglePlay()}
          ></i>
          <i className={`iconfont icon-xiayige ${styles.iconLast}`} onClick={() => {}}></i>
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
          <i className={`iconfont icon-ziyuan ${styles.icon}`} onClick={() => {}}></i>
          <i className={`iconfont icon-shengyin ${styles.icon}`} onClick={() => {}}></i>
          <i className={`iconfont icon-caidan ${styles.icon}`} onClick={() => {}}></i>
          <Popover content={options} title={'主题切换'} trigger="click" placement="topRight">
            <i className={`iconfont icon-more ${styles.icon}`} onClick={() => {}}></i>
          </Popover>
        </div>
      </div>
    </>
  )
}

export default memo(AudioPlayer)
