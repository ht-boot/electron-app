import React, { useMemo, useState, useEffect, useRef, memo, useCallback } from 'react'
import { message } from 'antd'
import createAudio from '../../utils/createAudio'
import { updateMusicCurrentTime, updateMusicCurrentPlay } from '../../store/baseSlice/base'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@renderer/store'
import EVTheme from '../../components/theme'
import EVMenu from '../menu'
import EVSound from '../../components/systemSound'
import styles from './index.module.less'

const formatTime = (seconds = 0): string => {
  if (!isFinite(seconds) || seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const AudioPlayer = (): React.JSX.Element => {
  const data = useSelector((state: RootState) => state.base.musicList)
  const musicCurrentPlay = useSelector((state: RootState) => state.base.musicCurrentPlay)
  const dispatch = useDispatch<AppDispatch>()

  const [messageApi, contextHolder] = message.useMessage()

  // audio 实例用 ref 管理（每次切歌会重建实例）
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 本地 UI 状态
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0-100
  const [totalTime, setTotalTime] = useState(0)

  // 记录拖拽前的播放状态，拖拽时暂停，结束后恢复
  const wasPlayingRef = useRef(false)

  // -------- 创建 / 切换 audio 实例 --------
  useEffect(() => {
    if (!data || !data.length) return

    const url = data[musicCurrentPlay]?.url
    if (!url) return

    // 如果已存在 audio，先清理
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // createAudio 返回 HTMLAudioElement
    const audio = createAudio(url) as HTMLAudioElement
    audioRef.current = audio

    // 设置一些默认值
    setIsPlaying(!audio.paused && !audio.ended)
    setProgress(0)
    setTotalTime(isFinite(audio.duration) ? audio.duration : 0)
    dispatch(updateMusicCurrentTime(0))

    const onLoadedMetadata = () => {
      setTotalTime(audio.duration || 0)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => {
      setIsPlaying(false)
      messageApi.error('音频加载失败，以为您跳转下一首')

      if (musicCurrentPlay + 1 >= data.length - 1) {
        dispatch(updateMusicCurrentPlay(0))
        return
      }
      dispatch(updateMusicCurrentPlay(musicCurrentPlay + 1))
    }
    const onEnded = () => {
      setIsPlaying(false)
      // 自动下一首
      if (musicCurrentPlay + 1 >= data.length - 1) {
        dispatch(updateMusicCurrentPlay(0))
        return
      }
      dispatch(updateMusicCurrentPlay(musicCurrentPlay + 1))
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata) // 元数据加载完成
    audio.addEventListener('play', onPlay) // 开始播放
    audio.addEventListener('pause', onPause) // 暂停
    audio.addEventListener('error', onError) // 错误
    audio.addEventListener('ended', onEnded) // 播放结束

    // 切换自动播放新歌
    audio.play().catch(() => {
      /* 处理被阻止 */
    })

    return () => {
      // 清理所有事件监听，停止并释放资源
      if (!audioRef.current) return
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)

      audio.pause()
      audio.src = ''
      audio.load()
      // 不把 audioRef.current 置 null 以免在正在卸载时读到 null race
      audioRef.current = null
    }
    // 当 musicCurrentPlay 或 data 改变时重建音频
  }, [data, musicCurrentPlay, dispatch, messageApi])

  // -------- 用 requestAnimationFrame 做高频 UI 同步，并节流 dispatch 到 redux --------
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let rafId = 0
    let lastDispatchTime = 0 // 记录最后一次 dispatch 的时间，用于节流
    const DISPATCH_INTERVAL = 200 // ms，控制 dispatch 频率（调整可选）

    const tick = () => {
      const a = audioRef.current // audio
      if (!a) {
        rafId = requestAnimationFrame(tick)
        return
      }
      const cur = a.currentTime || 0
      const dur = isFinite(a.duration) ? a.duration : 0
      setProgress(dur > 0 ? (cur / dur) * 100 : 0)
      setTotalTime(dur)

      const now = performance.now()
      if (now - lastDispatchTime > DISPATCH_INTERVAL) {
        // 将播放时间下发到 redux，节流以避免性能问题
        dispatch(updateMusicCurrentTime(cur))
        lastDispatchTime = now
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [dispatch, musicCurrentPlay]) // 重建 audio 时会重新运行

  // -------- 播放 / 暂停 切换 --------
  const handleTogglePlay = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      // play 返回 promise，可能会被浏览器策略阻止
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          setIsPlaying(false)
          // 若被阻止（如未用户交互），可以提示或静默处理
          messageApi.error('音频加载失败，请尝试其他歌曲')
        })
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [messageApi])

  // -------- 切歌（上一/下一） --------
  const handleSwitchMusic = useCallback(
    (delta: number) => {
      if (!data || !data.length) return
      const newIndex = musicCurrentPlay + delta
      if (newIndex < 0 || newIndex >= data.length) {
        if (delta > 0) {
          // 下一首
          dispatch(updateMusicCurrentPlay(0))
        } else {
          // 上一首
          dispatch(updateMusicCurrentPlay(data.length - 1))
        }
        return
      }
      // 通过改变 redux 的 musicCurrentPlay 来触发上面的 effect 重建 audio
      dispatch(updateMusicCurrentPlay(newIndex))
    },
    [data, musicCurrentPlay, dispatch]
  )

  // -------- 进度条交互（点击/拖拽） --------
  const progressRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = progressRef.current
    if (!el) return

    let dragging = false

    const onProgressDown = (e: PointerEvent) => {
      e.preventDefault() // 防止拖拽时选中文字
      dragging = true
      el.setPointerCapture(e.pointerId) // 捕获 pointer 事件，防止事件冒泡到其他元素

      const audio = audioRef.current
      if (!audio) return
      // 记录拖拽前播放状态并暂停
      wasPlayingRef.current = !audio.paused && !audio.ended
      if (!audio.paused) audio.pause()
      // 更新进度
      undateByProgress(e)
    }

    const onProgressMove = (e: PointerEvent) => {
      if (!dragging) return
      undateByProgress(e)
    }

    const onProgressUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      try {
        el.releasePointerCapture(e.pointerId)
      } catch (err) {
        // ignore
      }
      // 恢复播放状态
      const audio = audioRef.current
      if (audio && wasPlayingRef.current) {
        audio.play().catch(() => {
          messageApi.warning('自动播放被浏览器阻止，请手动点击播放')
        })
      }
    }

    const undateByProgress = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const audio = audioRef.current
      if (!audio || !isFinite(audio.duration)) {
        setProgress(pos * 100)
        // 不能设置 currentTime
        return
      }
      audio.currentTime = pos * audio.duration
      setProgress(pos * 100)
      // 立刻同步 redux，使歌词立刻响应
      dispatch(updateMusicCurrentTime(audio.currentTime))
    }

    el.addEventListener('pointerdown', onProgressDown)
    window.addEventListener('pointermove', onProgressMove)
    window.addEventListener('pointerup', onProgressUp)

    return () => {
      el.removeEventListener('pointerdown', onProgressDown)
      window.removeEventListener('pointermove', onProgressMove)
      window.removeEventListener('pointerup', onProgressUp)
    }
  }, [dispatch, messageApi])

  // -------- 组件卸载清理（确保 audio 释放） --------
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current.load()
        audioRef.current = null
      }
    }
  }, [])

  const musicCurrentTimeDisplay = useMemo(() => {
    // 用 redux store 的时间显示，如果需要可从 redux 读取 currentTime 格式化
    // 这里我们只用 local progress->time 或 totalTime
    // 但为了简单，我用 progress * totalTime
    const sec = (progress / 100) * (totalTime || 0)
    return formatTime(sec)
  }, [progress, totalTime])

  return (
    <>
      <div className={styles.audioPlayerControls}>
        <div className={styles.icons}>
          {contextHolder}
          <i
            className={`iconfont icon-shangyige ${styles.iconNext}`}
            onClick={() => handleSwitchMusic(-1)}
          />
          <i
            className={`iconfont ${isPlaying ? 'icon-zanting' : 'icon-icon_play'} ${styles.iconPlay}`}
            onClick={() => handleTogglePlay()}
          />
          <i
            className={`iconfont icon-xiayige ${styles.iconLast}`}
            onClick={() => handleSwitchMusic(1)}
          />
        </div>

        <div className={styles.audioPlayerProgressBar}>
          <div className={styles.infoTime}>
            <div className={styles.songInfo}>
              <span className={styles.songName}>{data[musicCurrentPlay]?.title}</span> -{' '}
              <span className={styles.singer}>
                {data[musicCurrentPlay]?.author.length > 8
                  ? data[musicCurrentPlay]?.author.substring(0, 8) + '...'
                  : data[musicCurrentPlay]?.author || '-'}
              </span>
            </div>
            <div className={styles.time}>
              <span className={styles.currentTime}>{musicCurrentTimeDisplay}</span> /{' '}
              <span className={styles.totalTime}>{formatTime(totalTime)}</span>
            </div>
          </div>

          <div ref={progressRef} className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={styles.audioPlayerLeft}>
          <i className="iconfont icon-ziyuan icon" />
          <EVSound />
          <EVMenu />
          <EVTheme />
        </div>
      </div>
    </>
  )
}

export default memo(AudioPlayer)
