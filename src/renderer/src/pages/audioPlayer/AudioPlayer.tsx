import React, { useMemo, useState, useEffect, useRef } from 'react'
import useAudioTime from '../../hooks/useAudioTime'
import createAudio from '../../utils/createAudio'
import styles from './index.module.less'
const AudioPlayer = (): React.JSX.Element => {
  // 创建 Audio 对象, 进行函数缓存， 避免组件更新重复创建audio
  const audio = useMemo(
    () => createAudio('http://music.163.com/song/media/outer/url?id=2699961119.mp3'),
    []
  )
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
    const updateProgress = (): void => {
      if (audio && !audio.paused) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    // 监听音频播放进度，更新进度条
    audio.addEventListener('timeupdate', updateProgress)
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
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
              <span className={styles.songName}>Song Name</span> -{' '}
              <span className={styles.singer}>Singer</span>
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
        <div className={styles.audioPlayerLeft}>Left Side</div>
      </div>
    </>
  )
}

export default AudioPlayer
