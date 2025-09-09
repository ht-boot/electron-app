import React from 'react'
import styles from './index.module.less'

const TitleBar = (): React.JSX.Element => {
  const handleMinimize = () => {
    window.electronAPI.minimize()
  }
  const handleClose = () => {
    window.electronAPI.close()
  }

  return (
    <div className={styles.titleBar}>
      <div className={styles.title}>My App</div>
      <div className={styles.buttons}>
        <button onClick={handleMinimize}>mini</button>
        <button onClick={handleClose}>close</button>
      </div>
    </div>
  )
}

export default TitleBar
