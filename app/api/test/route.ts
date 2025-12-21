import { NextResponse } from "next/server"

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            message: "测试 API 调用成功",
            timestamp: new Date().toISOString(),
            data: {
                version: "1.0.0",
                status: "running",
            },
        })
    } catch (error) {
        console.error("测试 API 错误:", error)
        return NextResponse.json(
            { error: "服务器错误" },
            { status: 500 }
        )
    }
}

