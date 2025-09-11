import React, { useMemo, useEffect, useRef, memo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import initLyrics from '../../utils/initLyrics'
import styles from './index.module.less'

interface LyricItem {
  t: number // 时间戳，数字类型
  c: string // 歌词内容
}
const Home = (): React.JSX.Element => {
  const data = useSelector((state: RootState) => state.base.musicList)
  const currentTime = useSelector((state: RootState) => state.base.musicCurrentTime)
  const musicCurrentPlay = useSelector((state: RootState) => state.base.musicCurrentPlay)
  // 初始化歌词数据
  const lyrics = useMemo<LyricItem[]>(() => {
    if (!data || !data[musicCurrentPlay] || !data[musicCurrentPlay].lrc) {
      return []
    }
    return initLyrics(data[musicCurrentPlay].lrc) || []
  }, [data, musicCurrentPlay])

  const activeLineRef = useRef<HTMLDivElement>(null) // 添加当前活动歌词行的ref

  // 监听当前播放时间变化，实现歌词滚动
  const prevActiveIndex = useRef<number>(-1)
  const LYRICS_OFFSET = -0.5 // 单位秒，可以手动调节

  useEffect(() => {
    if (!lyrics.length) return

    const current = currentTime + LYRICS_OFFSET // 当前播放时间
    const index = lyrics.findIndex((item, i) => {
      const next = lyrics[i + 1]?.t ?? Infinity
      return current >= item.t && current < next
    })

    if (index !== -1 && index !== prevActiveIndex.current) {
      prevActiveIndex.current = index
      activeLineRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentTime, lyrics])

  // const handleCheckLyric = (time: number): void => {
  //   dispatch(updateMusicCurrentTime(time))
  // }

  return (
    <>
      <div className={styles.home}>
        {/* 专辑封面展示区域 */}
        <div className={styles.album}>
          <img src={data[musicCurrentPlay].pic} alt="" />
        </div>
        {/* 歌曲信息容器 */}
        <div className={styles.songInfo}>
          {/* 歌曲名称 */}
          <div className={styles.songName}>{data[musicCurrentPlay].title}</div>
          {/* 作者 */}
          <div className={styles.author}>{data[musicCurrentPlay].author}</div>
          {/* 歌词展示区域 */}
          <div className={styles.lyrics}>
            {lyrics && lyrics.length > 0 ? (
              lyrics.map((item, index) => {
                // 检查当前行是否是活动行
                const current = parseFloat(currentTime.toFixed(2))
                const next = lyrics[index + 1]?.t ?? Infinity
                const isActive = current >= item.t + LYRICS_OFFSET && current < next + LYRICS_OFFSET

                return (
                  <div
                    key={index}
                    ref={isActive ? activeLineRef : null} // 只为活动行设置ref
                    className={`${styles.lyricLine} ${isActive ? styles.active : ''}`}
                  >
                    {item.c}
                  </div>
                )
              })
            ) : (
              <div className={styles.lyricLine}>暂无歌词</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(Home)
