import { useState, useEffect, useCallback } from 'react'

interface AudioTime {
  currentTime: string
  totalTime: string
}

/**
 * 自定义Hook：用于获取和格式化音频的当前时间和总时长
 * @param audio - HTMLAudioElement 音频元素实例
 * @returns AudioTime - 包含当前时间和总时长的对象
 */
function useAudioTime(audio: HTMLAudioElement): AudioTime {
  // 使用useState钩子管理当前时间和总时长的状态
  // 初始值都为'00:00'格式
  const [currentTime, setCurrentTime] = useState('00:00')
  const [totalTime, setTotalTime] = useState('00:00')

  // 使用useCallback记忆化时间格式化函数，避免不必要的重新创建
  const formatTime = useCallback((time: number): string => {
    // 计算分钟数
    const minutes = Math.floor(time / 60)
    // 计算秒数
    const seconds = Math.floor(time % 60)
    // 返回格式化后的时间字符串，确保分钟和秒数都是两位数
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }, [])

  // 使用useEffect处理音频元数据加载和时间更新事件
  useEffect(() => {
    // 处理音频元数据加载完成的事件处理函数
    const handleLoadedMetadata = (): void => {
      // 设置总时长为音频的duration属性，使用formatTime格式化
      setTotalTime(formatTime(audio.duration))
    }

    // 处理音频播放时间更新的事件处理函数
    const handleTimeUpdate = (): void => {
      // 设置当前时间为音频的currentTime属性，使用formatTime格式化
      setCurrentTime(formatTime(audio.currentTime))
    }

    // 添加事件监听器
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)

    // 清理函数：组件卸载时移除事件监听器，防止内存泄漏
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [audio, formatTime]) // 依赖项包括audio元素和formatTime函数

  // 返回包含当前时间和总时长的对象
  return { currentTime, totalTime }
}

export default useAudioTime
