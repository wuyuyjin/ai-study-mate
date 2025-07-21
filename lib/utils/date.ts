/**
 * 格式化日期时间的工具函数
 */

/**
 * 将ISO日期字符串格式化为本地时间
 * @param dateString ISO格式的日期字符串
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  dateString: string,
  options: {
    includeTime?: boolean
    relative?: boolean
    format?: 'short' | 'medium' | 'long'
  } = {}
): string {
  const {
    includeTime = false,
    relative = false,
    format = 'medium'
  } = options

  const date = new Date(dateString)
  const now = new Date()

  // 如果需要相对时间
  if (relative) {
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return '刚刚'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}分钟前`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}小时前`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}天前`
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months}个月前`
    } else {
      const years = Math.floor(diffInSeconds / 31536000)
      return `${years}年前`
    }
  }

  // 格式化选项
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
    day: 'numeric',
  }

  if (includeTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
  }

  return date.toLocaleDateString('zh-CN', formatOptions)
}

/**
 * 格式化为简短的日期时间
 * @param dateString ISO格式的日期字符串
 * @returns 格式化后的日期时间字符串，如 "2025-01-21 13:27"
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化为相对时间
 * @param dateString ISO格式的日期字符串
 * @returns 相对时间字符串，如 "3天前"
 */
export function formatRelativeTime(dateString: string): string {
  return formatDate(dateString, { relative: true })
}

/**
 * 格式化为友好的日期显示
 * @param dateString ISO格式的日期字符串
 * @returns 友好的日期字符串，如 "2025年1月21日"
 */
export function formatFriendlyDate(dateString: string): string {
  return formatDate(dateString, { format: 'long' })
}
