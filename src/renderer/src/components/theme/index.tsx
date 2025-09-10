import { MoonOutlined, RedoOutlined, SunOutlined } from '@ant-design/icons'
import { Popover } from 'antd'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styles from './index.module.less'
import { RootState } from '@renderer/store'

const EVTheme = (): React.JSX.Element => {
  const [theme, setTheme] = useState<string>('light')
  const data = useSelector((state: RootState) => state.base.musicList)
  const musicCurrentPlay = useSelector((state: RootState) => state.base.musicCurrentPlay)
  // 跟随系统切换主题
  const symtemTheme = (): void => {
    const bodyEl = document.body
    bodyEl.style.backgroundImage = `url(${data[musicCurrentPlay].pic})`
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
  return (
    <>
      <Popover content={options} title={'主题切换'} trigger="click" placement="topRight">
        <i className="iconfont icon-more icon" onClick={() => {}}></i>
      </Popover>
    </>
  )
}

export default EVTheme
