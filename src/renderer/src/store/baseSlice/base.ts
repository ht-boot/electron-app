import { createSlice } from '@reduxjs/toolkit'

// 定义异步获取音乐的 thunk
// export const fetchMusicList = createAsyncThunk('base/fetchMusicList', async () => {})

export const baseSlice = createSlice({
  name: 'base',
  initialState: {
    musicCurrentTime: 0,
    musicCurrentPlay: 0,
    musicList: [
      {
        type: 'mp3',
        title: '测试音乐',
        author: '测试作者',
        lrc: '',
        url: 'http://music.163.com/song/media/outer/url?id=1901371647.mp3',
        pic: 'http://p4.music.126.net/6y-UleORITEDbvrOLV0Q8A==/109951165935712766.jpg?param=130y130'
      }
    ]
  },
  reducers: {
    updateMusicList(state, action) {
      state.musicList = action.payload
    },
    updateMusicCurrentTime(state, action) {
      state.musicCurrentTime = action.payload
    },
    updateMusicCurrentPlay(state, action) {
      state.musicCurrentPlay = action.payload
    }
  }
})
// 每个 case reducer 函数会生成对应的 Action creators
export const { updateMusicCurrentTime, updateMusicCurrentPlay, updateMusicList } = baseSlice.actions

export default baseSlice.reducer
