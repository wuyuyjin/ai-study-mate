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

    const { cards } = await req.json()

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "无效的卡片数据" }, { status: 400 })
    }

    // 验证卡片数据
    for (const card of cards) {
      if (!card.title || !card.content) {
        return NextResponse.json({ error: "卡片标题和内容不能为空" }, { status: 400 })
      }
    }

    // 检查用户卡片数量限制
    const existingCardsCount = await prisma.studyCard.count({
      where: { userId }
    })

    // 获取用户信息判断是否为付费用户（简化处理）
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    const isPremiumUser = user?.email?.includes('premium') || false
    const cardLimit = isPremiumUser ? null : 30 // 免费用户30张，付费用户无限

    if (cardLimit && existingCardsCount + cards.length > cardLimit) {
      return NextResponse.json({
        error: "卡片数量超出限制",
        message: `免费用户最多只能创建${cardLimit}张卡片，当前已有${existingCardsCount}张。升级到专业版解锁无限制！`,
        currentCount: existingCardsCount,
        limit: cardLimit,
        isPremiumUser: false
      }, { status: 403 })
    }

    // 保存卡片到数据库
    const savedCards = await Promise.all(
      cards.map(async (card: any) => {
        return await prisma.studyCard.create({
          data: {
            userId,
            title: card.title,
            content: card.content,
            question: card.question || "",
            answer: card.answer || "",
            tags: JSON.stringify(card.tags || []),
            difficulty: card.difficulty || "medium",
            isFavorite: false,
            reviewCount: 0,
          },
        })
      })
    )

    return NextResponse.json({
      success: true,
      message: `成功保存 ${savedCards.length} 张卡片`,
      cards: savedCards.map(card => ({
        ...card,
        tags: JSON.parse(card.tags),
      })),
    })
  } catch (error) {
    console.error("保存卡片失败:", error)
    return NextResponse.json({ error: "保存失败，请稍后重试" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 从数据库获取用户的卡片
    const cards = await prisma.studyCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // 解析tags JSON字符串
    const cardsWithParsedTags = cards.map(card => ({
      ...card,
      tags: JSON.parse(card.tags),
    }))

    return NextResponse.json({
      success: true,
      cards: cardsWithParsedTags
    })
  } catch (error) {
    console.error("获取卡片失败:", error)
    return NextResponse.json({ error: "获取失败，请稍后重试" }, { status: 500 })
  }
}
