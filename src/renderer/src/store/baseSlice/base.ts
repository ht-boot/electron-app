import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 定义异步获取音乐的 thunk
export const fetchMusicList = createAsyncThunk('base/getMusicList', async () => {})

export const baseSlice = createSlice({
  name: 'base',
  initialState: {
    musicCurrentTime: 0,
    musicCurrentPlay: 0,
    musicList: {
      data: [
        {
          type: 'netease',
          link: 'http://music.163.com/#/song?id=2699961119',
          songid: 2699961119,
          title: '不要说话 王靖雯',
          author: '邓晃晃',
          lrc: '[00:18.06]深色的海面布满白色的月光\n[00:25.41]我出神望着海心不知飞哪去\n[00:31.14]听到她在告诉你\n[00:34.74]说她真的喜欢你\n[00:38.28]我不知该躲哪里\n[00:46.89]爱一个人是不是应该有默契\n[00:54.00]我以为你懂得每当我看着你\n[00:59.79]我藏起来的秘密\n[01:03.66]在每一天清晨里\n[01:07.08]暖成咖啡安静的拿给你\n[01:14.04]愿意用一支黑色的铅笔\n[01:18.72]画一出沉默舞台剧\n[01:22.68]灯光再亮也抱住你\n[01:28.59]愿意在角落唱沙哑的歌\n[01:32.97]再大声也都是给你\n[01:36.87]请用心听不要说话\n[01:51.57]爱一个人是不是应该有默契\n[01:58.50]我以为你懂得每当我看着你\n[02:04.26]我藏起来的秘密\n[02:08.13]在每一天清晨里\n[02:11.49]暖成咖啡安静的拿给你\n[02:18.48]愿意用一支黑色的铅笔\n[02:23.16]画一出沉默舞台剧\n[02:27.18]灯光再亮也抱住你\n[02:31.71]愿意在角落唱沙哑的歌\n[02:37.47]再大声也都是给你\n[02:41.43]请用心听不要说话\n[02:47.19]愿意用一支黑色的铅笔\n[02:51.78]画一出沉默舞台剧\n[02:55.80]灯光再亮也抱住你\n[03:00.18]愿意在角落唱沙哑的歌\n[03:06.15]再大声也都是给你\n[03:10.08]请原谅我不会说话\n',
          url: 'http://music.163.com/song/media/outer/url?id=2699961119.mp3',
          pic: 'http://p1.music.126.net/PgVFIXRGTEXorHa1Oj82cQ==/109951170926319782.jpg?param=300x300'
        }
      ],
      code: 200,
      error: ''
    }
  },
  reducers: {
    updateMusicCurrentTime(state, action) {
      state.musicCurrentTime = action.payload
    },
    updateMusicCurrentPlay(state, action) {
      state.musicCurrentPlay = action.payload
    }
  }
})
// 每个 case reducer 函数会生成对应的 Action creators
export const { updateMusicCurrentTime, updateMusicCurrentPlay } = baseSlice.actions

export default baseSlice.reducer
