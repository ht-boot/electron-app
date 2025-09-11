import React, { useEffect, useState } from 'react'
import styles from './index.module.less'
import { Slider } from 'antd'

declare global {
  interface Window {
    volumeAPI: {
      get: () => Promise<number>
      set: (value: number) => Promise<boolean>
      mute: (mute: boolean) => Promise<boolean>
    }
  }
}

const EVSound = (): React.JSX.Element => {
  const [volume, setVolume] = useState(10)
  const [lastVolume, setLastVolume] = useState(10) // 记住静音前的音量
  const [isMuted, setIsMuted] = useState(false)

  // 初始化音量
  useEffect(() => {
    window.volumeAPI.get().then((v) => {
      setVolume(v)
      setLastVolume(v)
      setIsMuted(v === 0)
    })
  }, [])

  // 本地滑块拖动
  const handleChange = (num: number) => {
    setVolume(num)
    if (num > 0) {
      setLastVolume(num)
      setIsMuted(false)
    } else {
      setIsMuted(true)
    }
  }

  // 拖动结束 → 调用系统 API
  const handleAfterChange = async (num: number) => {
    await window.volumeAPI.set(num)
  }

  // 静音切换
  const handleToggleMute = async () => {
    if (isMuted) {
      // 取消静音 → 恢复上次音量
      await window.volumeAPI.set(lastVolume)
      setVolume(lastVolume)
      setIsMuted(false)
    } else {
      // 静音 → 记住当前音量
      setLastVolume(volume || 50)
      await window.volumeAPI.set(0)
      setVolume(0)
      setIsMuted(true)
    }
    await window.volumeAPI.mute(!isMuted)
  }

  return (
    <div className={styles.container}>
      <i
        className={`icon iconfont ${isMuted || volume === 0 ? 'icon-jingyin2' : 'icon-shengyin'}`}
        onClick={handleToggleMute}
      />
      <div className={styles.controller}>
        <Slider
          className={styles.slider}
          min={0}
          max={100}
          value={volume}
          tooltip={{ formatter: null }}
          onChange={handleChange}
          onChangeComplete={handleAfterChange}
        />
      </div>
    </div>
  )
}

export default EVSound
