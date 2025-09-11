import React, { useState } from 'react'
import styles from './index.module.less'
import { Input } from 'antd'
import { CloseOutlined, MinusOutlined, SearchOutlined } from '@ant-design/icons'
import { AppDispatch } from '@renderer/store'
import { updateMusicList } from '../../store/baseSlice/base'
import { useDispatch } from 'react-redux'

const AppBar = (): React.JSX.Element => {
  const [key, setKey] = useState('普通女孩')
  const dispatch = useDispatch<AppDispatch>()
  // 歌曲查询
  const searchMusic = async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
    const { data } = await window.api.searchMusic((e.target as HTMLInputElement).value)
    dispatch(updateMusicList(data))
    setKey((e.target as HTMLInputElement).value)
  }
  const handleMinimize = () => {
    window.electronAPI.minimize()
  }
  const handleClose = () => {
    window.electronAPI.close()
  }

  return (
    <div className={styles.appBar}>
      <div className={styles.logo}>logo </div>
      <Input
        className={styles.searchInput}
        prefix={<SearchOutlined />}
        placeholder="输入歌曲名称"
        defaultValue={key}
        onPressEnter={(e) => searchMusic(e)}
      />
      <div className={styles.btns}>
        <MinusOutlined className={styles.mini} onClick={handleMinimize} />
        <CloseOutlined className={styles.close} onClick={handleClose} />
      </div>
    </div>
  )
}

export default AppBar
