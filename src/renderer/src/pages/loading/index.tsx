import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateMusicList } from '../../store/baseSlice/base'
import EVLoading from './loading'
import EVWinOperation from '@renderer/components/winOperation'

const Loading = (): React.JSX.Element => {
  const [key] = useState('普通女孩') // 默认搜索关键词
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const searchMusic = async (): Promise<void> => {
      try {
        const { data } = await window.api.searchMusic(key)
        dispatch(updateMusicList(data))
      } catch (error) {
        console.error('搜索音乐失败:', error)
      } finally {
        navigate('/home')
      }
    }
    searchMusic()
  }, [dispatch, key, navigate])

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh'
        }}
      >
        <EVWinOperation />
        <EVLoading />
      </div>
    </>
  )
}

export default Loading
