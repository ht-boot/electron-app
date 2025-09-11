import React, { forwardRef, useImperativeHandle, useState, memo } from 'react'
import { Drawer } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@renderer/store'
import { updateMusicCurrentPlay } from '../../store/baseSlice/base'
import styles from './index.module.less'

interface ChildRef {
  handleClose: () => void
}
const EVMenu = forwardRef<ChildRef>((_props, ref): React.JSX.Element => {
  const data = useSelector((state: RootState) => state.base.musicList)
  const musicCurrentPlay = useSelector((state: RootState) => state.base.musicCurrentPlay)

  const dispatch = useDispatch<AppDispatch>()

  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // 点击播放
  const handleCheckPlay = (index: number) => {
    dispatch(updateMusicCurrentPlay(index))
  }

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    handleClose,
    handleOpen
  }))

  return (
    <>
      <Drawer
        className={styles.drawer}
        title="音乐菜单"
        onClose={() => handleClose()}
        open={open}
        placement="left"
      >
        <div className={styles.musicTitle}>
          <p className={styles.pic}>专辑</p>
          <p className={styles.title}>歌曲</p>
          <p className={styles.author}>歌手</p>
          <p className={styles.type}>平台</p>
        </div>

        {data.map((item, index) => {
          return (
            <div
              className={`${styles.musicItem} ${index === musicCurrentPlay ? styles.active : ''}`}
              key={index}
              onClick={() => {
                handleCheckPlay(index)
              }}
            >
              <p className={styles.pic}>
                <img src={item.pic} alt="" />
              </p>
              <p className={styles.title}>
                {item.title.length > 4 ? item.title.slice(0, 4) + '...' : item.title}
              </p>
              <p className={styles.author}>
                {item.author.length > 5 ? item.author.slice(0, 4) + '...' : item.author}
              </p>
              <p className={styles.type}>{item.type}</p>
            </div>
          )
        })}
      </Drawer>

      <i className="iconfont icon-caidan icon" onClick={() => handleOpen()} />
    </>
  )
})

export default memo(EVMenu)
