import React, { useState } from 'react'
import styles from './index.module.less'
import { Input, message } from 'antd'
import { CloseOutlined, MinusOutlined, SearchOutlined } from '@ant-design/icons'
import { AppDispatch } from '@renderer/store'
import {
  updateMusicList,
  updateMusicCurrentPlay,
  updateMusicCurrentTime
} from '../../store/baseSlice/base'
import { useDispatch } from 'react-redux'

const TopBar = (): React.JSX.Element => {
  const [key, setKey] = useState('普通女孩')
  const dispatch = useDispatch<AppDispatch>()
  const [messageApi, contextHolder] = message.useMessage()

  // 歌曲查询
  const searchMusic = async (): Promise<void> => {
    if (!key.trim()) {
      messageApi.info('输入内容不能为空', 1.5)
      return
    }

    // loading
    messageApi.open({
      type: 'loading',
      content: '音乐搜索中，请稍等...',
      duration: 0
    })

    try {
      const { data } = await window.api.searchMusic(key.trim())
      if (data?.length > 0) {
        dispatch(updateMusicList(data))
        dispatch(updateMusicCurrentPlay(0)) // 重置当前播放歌曲index
        dispatch(updateMusicCurrentTime(0)) // 重置当前播放时间
      } else {
        messageApi.warning('未找到相关歌曲')
      }
    } catch (err) {
      messageApi.error('搜索失败，请稍后再试')
      console.error(err)
    } finally {
      messageApi.destroy()
    }
  }

  const handleMinimize = () => {
    window.electronAPI.minimize()
  }
  const handleClose = () => {
    window.electronAPI.close()
  }

  return (
    <div className={styles.appBar}>
      <div className={styles.logo}>logo</div>
      {contextHolder}

      <Input
        className={styles.searchInput}
        prefix={<SearchOutlined />}
        placeholder="输入歌手/歌曲名称"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onPressEnter={searchMusic}
        allowClear
      />

      <div className={styles.btns}>
        <MinusOutlined className={styles.mini} onClick={handleMinimize} />
        <CloseOutlined className={styles.close} onClick={handleClose} />
      </div>
    </div>
  )
}

export default TopBar
