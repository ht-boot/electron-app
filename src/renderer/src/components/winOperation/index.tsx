import React from 'react'
import { CloseOutlined, MinusOutlined } from '@ant-design/icons'
import styles from './index.module.less'

const EVWinOperation = (): React.JSX.Element => {
  const handleMinimize = () => {
    window.electronAPI.minimize()
  }
  const handleClose = () => {
    window.electronAPI.close()
  }
  return (
    <>
      <div className={styles.winOperation}>
        <MinusOutlined className={styles.mini} onClick={handleMinimize} />
        <CloseOutlined className={styles.close} onClick={handleClose} />
      </div>
    </>
  )
}

export default EVWinOperation
