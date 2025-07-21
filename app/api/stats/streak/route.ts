import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 获取当前用户ID的辅助函数
async function getCurrentUserId(req: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.userId
  } catch (error) {
    return null
  }
}

// 计算连续学习天数
function calculateStreak(activities: { date: string }[]): number {
  if (activities.length === 0) return 0

  // 按日期排序（最新的在前）
  const sortedDates = activities
    .map(activity => activity.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // 去重
  const uniqueDates = [...new Set(sortedDates)]

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < uniqueDates.length; i++) {
    const activityDate = new Date(uniqueDates[i])
    activityDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)

    if (activityDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)
    
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 获取用户的学习活动记录
    // 这里我们从多个来源收集活动：卡片创建、测验完成、卡片复习
    
    // 1. 卡片创建活动
    const cardActivities = await prisma.studyCard.findMany({
      where: { userId },
      select: { createdAt: true },
    })

    // 2. 测验活动（这里简化处理，实际应该有专门的测验记录表）
    const reviewActivities = await prisma.studyCard.findMany({
      where: { 
        userId,
        reviewCount: { gt: 0 }
      },
      select: { updatedAt: true },
    })

    // 合并所有活动并转换为日期字符串
    const allActivities = [
      ...cardActivities.map(activity => ({
        date: activity.createdAt.toISOString().split('T')[0]
      })),
      ...reviewActivities.map(activity => ({
        date: activity.updatedAt.toISOString().split('T')[0]
      }))
    ]

    // 计算连续天数
    const streak = calculateStreak(allActivities)

    // 计算其他统计信息
    const today = new Date().toISOString().split('T')[0]
    const todayActivities = allActivities.filter(activity => activity.date === today)

    return NextResponse.json({
      success: true,
      streak,
      todayActivities: todayActivities.length,
      totalActivities: allActivities.length,
      lastActivityDate: allActivities.length > 0 ? 
        Math.max(...allActivities.map(a => new Date(a.date).getTime())) : null
    })
  } catch (error) {
    console.error("获取连续天数失败:", error)
    return NextResponse.json({ error: "获取连续天数失败" }, { status: 500 })
  }
}

// 记录学习活动（可以在创建卡片、完成测验时调用）
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)
    
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { activityType, metadata } = await req.json()

    // 这里可以扩展为专门的学习活动记录表
    // 目前简化处理，主要通过卡片和测验记录来计算

    return NextResponse.json({
      success: true,
      message: "学习活动已记录"
    })
  } catch (error) {
    console.error("记录学习活动失败:", error)
    return NextResponse.json({ error: "记录学习活动失败" }, { status: 500 })
  }
}
