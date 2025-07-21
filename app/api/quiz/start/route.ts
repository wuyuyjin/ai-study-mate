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

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)
    
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 获取用户的所有卡片
    const allCards = await prisma.studyCard.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        question: true,
        answer: true,
        tags: true,
        difficulty: true,
        createdAt: true,
      },
    })

    if (allCards.length === 0) {
      return NextResponse.json({ 
        error: "您还没有任何卡片",
        message: "请先创建一些知识卡片再开始测验"
      }, { status: 400 })
    }

    // 如果卡片数量少于10张，使用所有卡片
    const quizSize = Math.min(10, allCards.length)
    
    // 随机选择卡片
    const shuffled = allCards.sort(() => 0.5 - Math.random())
    const selectedCards = shuffled.slice(0, quizSize)

    // 格式化测验数据
    const quizData = selectedCards.map((card, index) => ({
      id: card.id,
      questionNumber: index + 1,
      title: card.title,
      content: card.content,
      question: card.question,
      standardAnswer: card.answer,
      tags: JSON.parse(card.tags),
      difficulty: card.difficulty,
      userAnswer: "", // 用户答案，初始为空
    }))

    return NextResponse.json({
      success: true,
      quiz: {
        id: `quiz_${Date.now()}`, // 生成测验ID
        totalQuestions: quizSize,
        questions: quizData,
        startTime: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("创建测验失败:", error)
    return NextResponse.json({ error: "创建测验失败，请稍后重试" }, { status: 500 })
  }
}
