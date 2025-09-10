import axios from 'axios'

// 获取浏览器地址 url
const baseURL = 'https://music.iqwq.cn/'

const service = axios.create({
  // 默认地址请求地址
  baseURL,
  // 设置超时时间
  timeout: 10000
})

/**
 * @description 请求拦截
 */
service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 *@description 响应拦截
 */
service.interceptors.response.use(
  (res) => {
    const { data } = res
    // 全局错误信息拦截
    if (data.code && data.code !== 200) {
      return Promise.reject(data)
    }

    // 请求成功
    return data.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
