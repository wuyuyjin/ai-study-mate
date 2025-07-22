"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

interface StreakData {
  consecutiveDays: number
  lastActiveDate: string | null
  isNewDay: boolean
}

export function useStreak() {
  const [streak, setStreak] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isNewDay, setIsNewDay] = useState(false)
  const { user } = useAuth()

  // 获取连续使用天数
  const fetchStreak = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user/streak", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        setStreak(data.consecutiveDays)
      }
    } catch (error) {
      console.error("获取连续使用天数失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 更新连续使用天数（用户进入页面时调用）
  const updateStreak = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/user/streak", {
        method: "POST",
      })

      if (response.ok) {
        const data: StreakData = await response.json()
        setStreak(data.consecutiveDays)
        setIsNewDay(data.isNewDay)
        
        // 如果是新的一天，可以显示祝贺信息
        if (data.isNewDay && data.consecutiveDays > 1) {
          return {
            isNewRecord: true,
            days: data.consecutiveDays
          }
        }
      }
    } catch (error) {
      console.error("更新连续使用天数失败:", error)
    }

    return null
  }

  // 组件挂载时获取连续天数
  useEffect(() => {
    fetchStreak()
  }, [user])

  // 用户登录后自动更新连续天数
  useEffect(() => {
    if (user && !isLoading) {
      updateStreak()
    }
  }, [user, isLoading])

  return {
    streak,
    isLoading,
    isNewDay,
    updateStreak,
    fetchStreak,
  }
}
