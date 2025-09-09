/**
 * 节流函数
 * @param func 需要节流的函数
 * @param limit 时间限制，单位毫秒
 * @returns 节流后的函数
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> {
  let inThrottle: boolean = false
  let lastResult: ReturnType<T>
  let lastTime: number = 0 // 记录上次执行时间

  return (...args: Parameters<T>): ReturnType<T> => {
    const now = Date.now() // 获取当前时间戳

    // 如果距离上次执行时间超过了限制，或者第一次执行
    if (!inThrottle || now - lastTime >= limit) {
      // 执行函数并保存结果
      lastResult = func(...args)
      lastTime = now
      inThrottle = true

      // 设置定时器，在指定时间后重置状态
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }

    return lastResult
  }
}
export default throttle
