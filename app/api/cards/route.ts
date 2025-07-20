import { type NextRequest, NextResponse } from "next/server"

// 模拟数据存储（实际项目中应该使用数据库）
const cardsStorage: any[] = []

export async function POST(req: NextRequest) {
  try {
    const { cards } = await req.json()

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "无效的卡片数据" }, { status: 400 })
    }

    // 为每张卡片添加ID和时间戳
    const newCards = cards.map((card: any) => ({
      ...card,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      difficulty: "medium",
      isFavorite: false,
    }))

    // 保存到存储（实际项目中应该保存到数据库）
    cardsStorage.push(...newCards)

    return NextResponse.json({
      success: true,
      message: `成功保存 ${newCards.length} 张卡片`,
      cards: newCards,
    })
  } catch (error) {
    console.error("保存卡片失败:", error)
    return NextResponse.json({ error: "保存失败，请稍后重试" }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({ cards: cardsStorage })
  } catch (error) {
    console.error("获取卡片失败:", error)
    return NextResponse.json({ error: "获取失败，请稍后重试" }, { status: 500 })
  }
}
