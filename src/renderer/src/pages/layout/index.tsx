import React from 'react'
import { Layout } from 'antd'
import AudioPlayer from '../audioPlayer/AudioPlayer'
import styles from './index.module.less'

const { Content, Footer } = Layout

const AppLayout: React.FC = () => {
  return (
    <>
      <Layout style={{ backgroundColor: 'transparent' }}>
        <Content style={{ backgroundColor: 'transparent' }}>
          <div className={styles.content}>content</div>
        </Content>
      </Layout>
      <Footer className={styles.footer}>
        <AudioPlayer />
      </Footer>
    </>
  )
}

export default AppLayout
