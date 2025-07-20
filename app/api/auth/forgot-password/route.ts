import { type NextRequest, NextResponse } from "next/server"

// 模拟用户数据库
const users = [
  {
    id: "1",
    name: "演示用户",
    email: "demo@studymate.com",
    emailVerified: true,
  },
  {
    id: "2",
    name: "学习者",
    email: "learner@example.com",
    emailVerified: true,
  },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "请输入邮箱地址" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
    }

    // 查找用户
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    // 为了安全，无论用户是否存在都返回成功消息
    if (user) {
      console.log(`模拟发送密码重置邮件到: ${email}`)
    }

    return NextResponse.json({
      success: true,
      message: "如果该邮箱已注册，你将收到密码重置邮件",
    })
  } catch (error) {
    console.error("忘记密码API错误:", error)
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 })
  }
}
