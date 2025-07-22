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

// 获取收藏的卡片（带分页）
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'

    // 构建查询条件
    const where: any = {
      userId,
      isFavorite: true,
    }

    // 搜索条件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 标签筛选
    if (tag && tag !== 'all') {
      where.tags = { contains: tag }
    }

    // 排序条件
    let orderBy: any = { createdAt: 'desc' } // 默认按创建时间降序
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sortBy === 'title') {
      orderBy = { title: 'asc' }
    } else if (sortBy === 'difficulty') {
      orderBy = { difficulty: 'asc' }
    }

    // 获取总数
    const totalCount = await prisma.studyCard.count({ where })

    // 获取分页数据
    const cards = await prisma.studyCard.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    // 解析tags JSON字符串
    const cardsWithParsedTags = cards.map(card => ({
      ...card,
      tags: JSON.parse(card.tags),
    }))

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / pageSize)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      cards: cardsWithParsedTags,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    })
  } catch (error) {
    console.error("获取收藏卡片失败:", error)
    return NextResponse.json({ error: "获取失败，请稍后重试" }, { status: 500 })
  }
}

// 切换卡片收藏状态
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { cardId, isFavorite } = await req.json()

    if (!cardId) {
      return NextResponse.json({ error: "卡片ID不能为空" }, { status: 400 })
    }

    // 检查卡片是否存在且属于当前用户
    const existingCard = await prisma.studyCard.findFirst({
      where: { id: cardId, userId }
    })

    if (!existingCard) {
      return NextResponse.json({ error: "卡片不存在或无权限" }, { status: 404 })
    }

    // 更新收藏状态
    const updatedCard = await prisma.studyCard.update({
      where: { id: cardId },
      data: { isFavorite: isFavorite !== undefined ? isFavorite : !existingCard.isFavorite },
    })

    return NextResponse.json({
      success: true,
      message: updatedCard.isFavorite ? "已添加到收藏" : "已取消收藏",
      card: {
        ...updatedCard,
        tags: JSON.parse(updatedCard.tags),
      },
    })
  } catch (error) {
    console.error("更新收藏状态失败:", error)
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 })
  }
}
