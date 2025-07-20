import { type NextRequest, NextResponse } from "next/server"

// 模拟用户数据库
const users: any[] = [
  {
    id: "1",
    name: "演示用户",
    email: "demo@studymate.com",
    password: "demo123456",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    console.log("注册请求:", { name, email })

    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json({ error: "姓名、邮箱和密码都是必填项" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度不能少于6位" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 })
    }

    // 创建新用户
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase(),
      password: password, // 简化版本，实际项目中应该加密
      emailVerified: true, // 简化版本，直接设为已验证
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    console.log("新用户注册成功:", newUser.email)

    return NextResponse.json({
      success: true,
      message: "注册成功",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
      },
    })
  } catch (error) {
    console.error("注册API错误:", error)
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 })
  }
}
