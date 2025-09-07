/**
 * @description 创建音频对象
 * @url 音频文件路径
 * @returns 返回 audio 音频对象
 */

const createAudio = (url: string | null): HTMLAudioElement => {
  const audio = new Audio()
  audio.src = url ? url : 'http://music.163.com/song/media/outer/url?id=2699961119.mp3'
  audio.loop = true
  return audio
}

export default createAudio
