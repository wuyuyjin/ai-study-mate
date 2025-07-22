"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

/**
 * 连续使用天数跟踪组件
 * 这个组件会在用户访问任何页面时自动更新连续使用天数
 * 应该在应用的根布局中使用
 */
export function StreakTracker() {
  const { user } = useAuth()

  useEffect(() => {
    // 只有在用户登录时才跟踪
    if (!user) return

    const updateStreak = async () => {
      try {
        await fetch("/api/user/streak", {
          method: "POST",
        })
      } catch (error) {
        // 静默失败，不影响用户体验
        console.error("更新连续使用天数失败:", error)
      }
    }

    // 页面加载时更新连续天数
    updateStreak()

    // 设置定时器，每小时检查一次（防止用户长时间停留在页面）
    const interval = setInterval(updateStreak, 60 * 60 * 1000) // 1小时

    return () => clearInterval(interval)
  }, [user])

  // 这个组件不渲染任何内容
  return null
}
