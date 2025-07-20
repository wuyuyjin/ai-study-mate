import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// 模拟用户数据库
const users = [
  {
    id: "1",
    name: "演示用户",
    email: "demo@studymate.com",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "学习者",
    email: "learner@example.com",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
]

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 简化的token验证（实际项目中应该使用JWT）
    const tokenParts = token.split("_")
    if (tokenParts.length !== 3 || tokenParts[0] !== "token") {
      return NextResponse.json({ error: "无效的token" }, { status: 401 })
    }

    const userId = tokenParts[1]

    // 查找用户
    const user = users.find((u) => u.id === userId)
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: user,
    })
  } catch (error) {
    console.error("验证token错误:", error)
    return NextResponse.json({ error: "认证失败" }, { status: 401 })
  }
}
