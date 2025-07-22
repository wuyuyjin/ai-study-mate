import { type NextRequest, NextResponse } from "next/server"
import { generateCardsFromFileWithMoonshot } from "@/lib/moonshot-upload"
import { validateFileType, getFileTypeFromName } from "@/lib/pdf-processor"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const customTagsStr = formData.get("customTags") as string

    if (!file) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 })
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过10MB" }, { status: 400 })
    }

    // 验证文件类型
    if (!validateFileType(file)) {
      return NextResponse.json({ error: "不支持的文件格式，请上传PDF、Markdown或文本文件" }, { status: 400 })
    }

    const customTags = customTagsStr ? JSON.parse(customTagsStr) : []

    // 将文件转换为Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // 使用Moonshot AI生成卡片
    const result = await generateCardsFromFileWithMoonshot(
      buffer,
      file.name,
      customTags
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Moonshot AI生成卡片失败:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "生成失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}
