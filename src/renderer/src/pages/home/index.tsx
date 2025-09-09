import React, { useMemo, useState, useEffect, useRef, memo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import initLyrics from '../../utils/initLyrics'
import styles from './index.module.less'

// 假设在某个页面里
const searchMusic = async (): Promise<void> => {
  const data = await window.api.searchMusic('昙花一现雨及时')
  console.log('搜索结果：', data)
}
interface LyricItem {
  t: number // 时间戳，应该是数字类型
  c: string // 歌词内容
}
const Home = (): React.JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data } = useSelector((state: RootState) => state.base.musicList)
  const currentTime = useSelector((state: RootState) => state.base.musicCurrentTime)
  // 初始化歌词数据
  const lyrics = useMemo<LyricItem[]>(() => {
    if (!data || !data[currentIndex] || !data[currentIndex].lrc) {
      return []
    }
    return initLyrics(data[currentIndex].lrc) || []
  }, [data, currentIndex])

  const lyricsRef = useRef<HTMLDivElement>(null) // 添加歌词容器的ref
  const activeLineRef = useRef<HTMLDivElement>(null) // 添加当前活动歌词行的ref

  // 监听当前播放时间变化，实现歌词滚动
  useEffect(() => {
    if (!lyricsRef.current) return
    const container = lyricsRef.current

    // 如果当前没有活动行，则滚动到顶部
    if (!activeLineRef.current) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      return
    }
    // 获取歌词容器和歌词提示行的位置信息
    const activeLine = activeLineRef.current

    // 计算滚动位置，使活动歌词行滚动到容器中央
    const containerHeight = container.clientHeight
    const activeLineTop = activeLine.offsetTop
    const activeLineHeight = activeLine.clientHeight
    const scrollTo = activeLineTop - containerHeight / 2 - activeLineHeight

    // 平滑滚动到计算的位置
    container.scrollTo({
      top: scrollTo,
      behavior: 'smooth'
    })
  }, [currentTime]) // 当当前播放时间变化时触发

  // const handleCheckLyric = (time: number): void => {
  //   dispatch(updateMusicCurrentTime(time))
  // }

  return (
    <>
      <div className={styles.home}>
        <div onClick={() => searchMusic()}>加载</div>
        {/* 专辑封面展示区域 */}
        <div className={styles.album}>
          <img src={data[currentIndex].pic} alt="" />
        </div>
        {/* 歌曲信息容器 */}
        <div className={styles.songInfo}>
          {/* 歌曲名称 */}
          <div className={styles.songName}>{data[currentIndex].title}</div>
          {/* 作者 */}
          <div className={styles.author}>{data[currentIndex].author}</div>
          {/* 歌词展示区域 */}
          <div className={styles.lyrics} ref={lyricsRef}>
            {lyrics && lyrics.length > 0 ? (
              lyrics.map((item, index) => {
                // 检查当前行是否是活动行
                const isActive =
                  item.t <= parseFloat(currentTime.toFixed(2)) &&
                  (index === lyrics.length - 1 ||
                    lyrics[index + 1]?.t > parseFloat(currentTime.toFixed(2)))

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
