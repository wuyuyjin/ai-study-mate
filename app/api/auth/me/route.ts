import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import prisma from "@/lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 验证JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (jwtError) {
      return NextResponse.json({ error: "无效的token" }, { status: 401 })
    }

    // 从数据库获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        subscription: true,
        emailVerified: true,
        createdAt: true,
      },
    })

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
