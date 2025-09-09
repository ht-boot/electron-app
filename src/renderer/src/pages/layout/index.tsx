import React from 'react'
import { Layout } from 'antd'
import AudioPlayer from '../audioPlayer/AudioPlayer'
import styles from './index.module.less'
import { Outlet } from 'react-router-dom'

const { Content, Footer } = Layout

const AppLayout: React.FC = () => {
  return (
    <>
      <Layout style={{ backgroundColor: 'transparent' }}>
        <Content className={styles.content}>
          <Outlet /> {/* 路由出口 */}
        </Content>
      </Layout>
      <Footer className={styles.footer}>
        <AudioPlayer /> {/* 音频播放器 */}
      </Footer>
    </>
  )
}

export default AppLayout
