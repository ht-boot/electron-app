/**
 * 防抖函数
 * @param func 需要防抖的函数
 * @param delay 延迟时间，单位毫秒
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => ReturnType<T> | void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastResult: ReturnType<T> | undefined

  return function (this: any, ...args: Parameters<T>): ReturnType<T> | void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this
    const callNow = immediate && !timeoutId

    // 如果之前有定时器，清除它
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      timeoutId = null
      // 如果不是立即执行模式，则执行函数
      if (!immediate) {
        lastResult = func.apply(context, args)
      }
    }, delay)

    // 如果是立即执行模式且没有定时器，则立即执行函数
    if (callNow) {
      lastResult = func.apply(context, args)
    }

    return lastResult
  }
}

export default debounce
