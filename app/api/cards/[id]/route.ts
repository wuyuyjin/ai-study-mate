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

// 更新卡片
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = params
    const { title, content, question, answer, tags, difficulty, isFavorite } = await req.json()

    // 验证卡片数据
    if (!title || !content) {
      return NextResponse.json({ error: "卡片标题和内容不能为空" }, { status: 400 })
    }

    // 检查卡片是否存在且属于当前用户
    const existingCard = await prisma.studyCard.findFirst({
      where: { id, userId }
    })

    if (!existingCard) {
      return NextResponse.json({ error: "卡片不存在或无权限" }, { status: 404 })
    }

    // 更新卡片
    const updatedCard = await prisma.studyCard.update({
      where: { id },
      data: {
        title,
        content,
        question: question || "",
        answer: answer || "",
        tags: JSON.stringify(tags || []),
        difficulty: difficulty || "medium",
        isFavorite: isFavorite || false,
      },
    })

    return NextResponse.json({
      success: true,
      message: "卡片更新成功",
      card: {
        ...updatedCard,
        tags: JSON.parse(updatedCard.tags),
      },
    })
  } catch (error) {
    console.error("更新卡片失败:", error)
    return NextResponse.json({ error: "更新失败，请稍后重试" }, { status: 500 })
  }
}

// 删除卡片
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = params

    // 检查卡片是否存在且属于当前用户
    const existingCard = await prisma.studyCard.findFirst({
      where: { id, userId }
    })

    if (!existingCard) {
      return NextResponse.json({ error: "卡片不存在或无权限" }, { status: 404 })
    }

    // 删除卡片
    await prisma.studyCard.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "卡片删除成功",
    })
  } catch (error) {
    console.error("删除卡片失败:", error)
    return NextResponse.json({ error: "删除失败，请稍后重试" }, { status: 500 })
  }
}

// 获取单个卡片
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = params

    // 获取卡片
    const card = await prisma.studyCard.findFirst({
      where: { id, userId }
    })

    if (!card) {
      return NextResponse.json({ error: "卡片不存在或无权限" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      card: {
        ...card,
        tags: JSON.parse(card.tags),
      },
    })
  } catch (error) {
    console.error("获取卡片失败:", error)
    return NextResponse.json({ error: "获取失败，请稍后重试" }, { status: 500 })
  }
}
