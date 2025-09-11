import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateMusicList } from '../../store/baseSlice/base'

const Loading = (): React.JSX.Element => {
  const [key, setKey] = useState('普通女孩')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const searchMusic = async (): Promise<void> => {
      try {
        const { data } = await window.api.searchMusic(key)
        dispatch(updateMusicList(data))
        // 数据加载完成后自动跳转
        navigate('/home')
      } catch (error) {
        console.error('搜索音乐失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    searchMusic()
  }, [dispatch, key, navigate])

  // 手动点击跳转
  const handleNavigate = () => {
    navigate('/home')
  }

  return (
    <>
      <div
        onClick={handleNavigate}
        style={{
          cursor: 'pointer',
          width: '100px',
          height: '100px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {isLoading ? 'Loading...' : '点击进入首页'}
      </div>
    </>
  )
}

export default Loading
