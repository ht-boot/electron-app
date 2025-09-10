import React, { useEffect, useState } from 'react'
import styles from './index.module.less'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { AppDispatch } from '@renderer/store'
import { updateMusicList } from '../../store/baseSlice/base'
import { useDispatch } from 'react-redux'

const AppBar = (): React.JSX.Element => {
  const [key, setKey] = useState('不要说话')
  const dispatch = useDispatch<AppDispatch>()
  // 歌曲查询
  useEffect(() => {
    const searchMusic = async (): Promise<void> => {
      const { data } = await window.api.searchMusic(key)
      dispatch(updateMusicList(data))
    }
    searchMusic()
  }, [])
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
      <div className={styles.title}>戴上耳机</div>
      <Input
        className={styles.searchInput}
        prefix={<SearchOutlined />}
        placeholder="输入歌曲名称"
        defaultValue={key}
        onPressEnter={(e) => searchMusic(e)}
      />
      <div className={styles.buttons}>
        <button onClick={handleMinimize}>mini</button>
        <button onClick={handleClose}>close</button>
      </div>
    </div>
  )
}

export default AppBar
