import { type NextRequest, NextResponse } from "next/server"

// 简化版本，不依赖外部库
const users = [
  {
    id: "1",
    name: "演示用户",
    email: "demo@studymate.com",
    password: "demo123456", // 简化版本，实际项目中应该加密
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "学习者",
    email: "learner@example.com",
    password: "demo123456",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, rememberMe } = body

    console.log("登录请求:", { email, rememberMe })

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码都是必填项" }, { status: 400 })
    }

    // 查找用户
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 })
    }

    // 验证密码（简化版本）
    if (user.password !== password) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 })
    }

    // 检查邮箱是否已验证
    if (!user.emailVerified) {
      return NextResponse.json({ error: "请先验证你的邮箱地址" }, { status: 401 })
    }

    // 生成简单的token（实际项目中应该使用JWT）
    const token = `token_${user.id}_${Date.now()}`

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: token,
      message: "登录成功",
    })

    // 设置cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30天或7天
    })

    return response
  } catch (error) {
    console.error("登录API错误:", error)
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 })
  }
}
