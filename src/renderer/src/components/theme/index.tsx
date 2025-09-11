import { MoonOutlined, RedoOutlined, SunOutlined } from '@ant-design/icons'
import { Popover } from 'antd'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store'
import styles from './index.module.less'

const EVTheme = (): React.JSX.Element => {
  const [theme, setTheme] = useState<string>('system')
  const data = useSelector((state: RootState) => state.base.musicList)
  const musicCurrentPlay = useSelector((state: RootState) => state.base.musicCurrentPlay)

  //  应用浅色/深色主题
  const handleCheckTheme = (mode: 'light' | 'dark' | 'system') => {
    document.documentElement.setAttribute('data-theme', mode)
  }

  // 设置背景（封面模糊）
  const handleSetBg = (mode: string) => {
    const url = data?.[musicCurrentPlay]?.pic
    if (!url) {
      document.body.style.removeProperty('--bg-image')
      return
    }

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      if (prefersDark.matches) {
        document.body.style.setProperty('--bg-image', `url(${url})`)
      } else {
        document.body.style.removeProperty('--bg-image')
      }
    } else {
      document.body.style.removeProperty('--bg-image')
    }
  }

  // 切换主题
  const handleChangeTheme = (value: string, e: React.MouseEvent<any>) => {
    setTheme(value)
    localStorage.setItem('theme', value)

    const handleChange = () => {
      handleCheckTheme(value as 'light' | 'dark' | 'system')
      handleSetBg(value)
    }

    //  背景切换动画 startViewTransition
    if ((document as any).startViewTransition) {
      const transition = (document as any).startViewTransition(() => {
        handleChange()
      })

      transition.ready.then(() => {
        const { clientX, clientY } = e
        const radius = Math.hypot(
          Math.max(clientX, window.innerWidth - clientX),
          Math.max(clientY, window.innerHeight - clientY)
        )
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
    } else {
      // 兼容 fallback
      handleChange()
    }
  }

  // 初始化
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system'
    setTheme(savedTheme)

    if (savedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

      const setSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        handleCheckTheme(e.matches ? 'dark' : 'light')
        handleSetBg('system')
      }

      setSystemTheme(prefersDark)
      prefersDark.addEventListener('change', setSystemTheme)

      return () => {
        prefersDark.removeEventListener('change', setSystemTheme)
      }
    } else {
      handleCheckTheme(savedTheme as 'light' | 'dark')
      handleSetBg(savedTheme)
      return undefined
    }
  }, [musicCurrentPlay, data])

  const options = (
    <div className={styles.options}>
      <p
        className={`${styles.checkTheme} ${theme === 'system' ? styles.active : ''}`}
        onClick={(e) => handleChangeTheme('system', e)}
      >
        跟随系统 <RedoOutlined style={{ marginLeft: '10px' }} />
      </p>
      <p
        className={`${styles.checkTheme} ${theme === 'light' ? styles.active : ''}`}
        onClick={(e) => handleChangeTheme('light', e)}
      >
        浅色主题 <SunOutlined style={{ marginLeft: '10px' }} />
      </p>
      <p
        className={`${styles.checkTheme} ${theme === 'dark' ? styles.active : ''}`}
        onClick={(e) => handleChangeTheme('dark', e)}
      >
        暗色主题 <MoonOutlined style={{ marginLeft: '10px' }} />
      </p>
    </div>
  )

  return (
    <Popover content={options} title={'主题切换'} trigger="click" placement="topRight">
      <i className="iconfont icon-more icon" />
    </Popover>
  )
}

export default EVTheme
