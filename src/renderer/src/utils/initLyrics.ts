interface LyricLine {
  t: number // 时间（秒）
  c: string // 歌词
}

interface ToLRC {
  ms: LyricLine[]
  [key: string]: any
}

const oLRC: ToLRC = {
  ms: []
}

const initLyrics = (lrc: string): LyricLine[] | null => {
  oLRC.ms = []
  if (!lrc || lrc.trim().length === 0) return null

  const lrcArr = lrc.split('\n')

  lrcArr.forEach((line) => {
    const cleanLine = line.trim() // 去除首尾空格
    if (!cleanLine) return

    const timeTags = cleanLine.match(/\[(\d+:\d+(?:\.\d+)?)\]/g) || [] // 匹配时间标签
    const content = cleanLine.replace(/\[.*?\]/g, '').trim() // 去除时间标签后的内容

    // 如果时间标签为空，则认为是标签行
    if (timeTags.length === 0) {
      // 解析标签 (如 [ar:xxx] [ti:xxx])
      const tag = cleanLine.match(/\[(\w+):(.*)\]/)
      if (tag && tag[1] !== 'ms') {
        oLRC[tag[1].toLowerCase()] = tag[2]
      }
    } else {
      // 解析歌词时间戳
      timeTags.forEach((tag) => {
        const [min, sec] = tag.replace(/\[|\]/g, '').split(':')
        const t = Number(min) * 60 + Number(sec)
        oLRC.ms.push({ t, c: content })
      })
    }
  })

  oLRC.ms.sort((a, b) => a.t - b.t)

  return oLRC.ms
}

export default initLyrics
