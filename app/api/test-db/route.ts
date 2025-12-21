import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // 测试数据库连接
    await prisma.$connect()
    
    // 测试查询用户表
    const userCount = await prisma.user.count()
    
    // 测试查询一个用户
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        email: true,
        name: true,
      }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: "数据库连接成功",
      data: {
        userCount,
        sampleUser: users[0] || null,
      }
    })
  } catch (error: any) {
    console.error("数据库测试错误:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack,
    }, { status: 500 })
  }
}

