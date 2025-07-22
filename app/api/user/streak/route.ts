import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 获取当前用户ID的辅助函数
async function getCurrentUserId(_req: NextRequest): Promise<string | null> {
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

// 获取今天的日期（只包含年月日，不包含时间）
function getTodayDate(): Date {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

// 获取昨天的日期
function getYesterdayDate(): Date {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
}

// 检查并更新用户的连续使用天数
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const today = getTodayDate()
    const yesterday = getYesterdayDate()

    // 获取用户当前信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        consecutiveDays: true,
        lastActiveDate: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    let newConsecutiveDays = user.consecutiveDays
    let shouldUpdate = false

    // 如果用户今天还没有记录活跃
    if (!user.lastActiveDate || user.lastActiveDate.getTime() !== today.getTime()) {
      shouldUpdate = true

      if (!user.lastActiveDate) {
        // 第一次使用
        newConsecutiveDays = 1
      } else if (user.lastActiveDate.getTime() === yesterday.getTime()) {
        // 昨天有使用，连续天数+1
        newConsecutiveDays = user.consecutiveDays + 1
      } else {
        // 中断了，重新开始
        newConsecutiveDays = 1
      }
    }

    // 更新数据库
    if (shouldUpdate) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          consecutiveDays: newConsecutiveDays,
          lastActiveDate: today,
        }
      })
    }

    return NextResponse.json({
      success: true,
      consecutiveDays: newConsecutiveDays,
      isNewDay: shouldUpdate,
    })
  } catch (error) {
    console.error("更新连续使用天数失败:", error)
    return NextResponse.json({ error: "更新失败，请稍后重试" }, { status: 500 })
  }
}

// 获取用户的连续使用天数
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        consecutiveDays: true,
        lastActiveDate: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const today = getTodayDate()
    let currentStreak = user.consecutiveDays

    // 检查是否需要重置连续天数
    if (user.lastActiveDate) {
      const daysDiff = Math.floor((today.getTime() - user.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff > 1) {
        // 超过1天没有使用，重置连续天数
        currentStreak = 0
        await prisma.user.update({
          where: { id: userId },
          data: {
            consecutiveDays: 0,
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      consecutiveDays: currentStreak,
      lastActiveDate: user.lastActiveDate,
    })
  } catch (error) {
    console.error("获取连续使用天数失败:", error)
    return NextResponse.json({ error: "获取失败，请稍后重试" }, { status: 500 })
  }
}
