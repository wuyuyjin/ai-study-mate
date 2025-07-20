import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "@/lib/ai"
import { openai } from "@/lib/openai"
import { CardsResponseSchema } from "@/lib/schemas"
import { extractPdfText, extractMarkdownContent, validateFileType, getFileTypeFromName } from "@/lib/pdf-processor"

// 替换现有的提取函数
async function extractFileContent(file: File): Promise<string> {
  if (!validateFileType(file)) {
    throw new Error("不支持的文件格式")
  }

  const fileType = getFileTypeFromName(file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  switch (fileType) {
    case "pdf":
      return await extractPdfText(buffer)

    case "markdown":
      const markdownText = await file.text()
      return await extractMarkdownContent(markdownText)

    case "text":
      return await file.text()

    default:
      throw new Error("无法识别的文件类型")
  }
}

// 在POST函数中替换文本提取逻辑
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const mode = formData.get("mode") as string
    const customTagsStr = formData.get("customTags") as string

    if (!file) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 })
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过10MB" }, { status: 400 })
    }

    const customTags = customTagsStr ? JSON.parse(customTagsStr) : []

    // 使用新的文件内容提取函数
    const extractedText = await extractFileContent(file)

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "无法从文件中提取文本内容" }, { status: 400 })
    }

    // 限制文本长度
    const maxLength = 15000
    const truncatedText =
      extractedText.length > maxLength ? extractedText.substring(0, maxLength) + "..." : extractedText

    const systemPrompt =
      mode === "cards"
        ? `你是一个专业的学习助手。请将用户上传的文件内容转换为结构化的知识卡片。

要求：
1. 根据内容长度提取3-8个核心知识点
2. 每个知识点生成一张卡片
3. 标题要简洁明确，体现知识点核心
4. 内容要准确完整，包含关键信息和细节
5. 生成相关的测试问答，问题要有深度
6. 添加合适的标签分类
7. 如果是技术内容，包含代码示例或公式
8. 如果是理论内容，包含定义和应用场景

请确保生成的内容准确、有用，适合学习和复习。`
        : `你是一个专业的学习助手。请将用户上传的文件内容转换为问答形式的知识卡片。

要求：
1. 重点关注可以提问的知识点
2. 根据内容复杂度生成3-8个问答卡片
3. 问题要有挑战性和实用性，涵盖不同难度层次
4. 答案要准确完整，包含必要的解释
5. 添加合适的标签分类
6. 问题类型要多样化：概念理解、应用分析、对比总结等

请确保生成的问答有助于全面检验学习效果。`

    const userPrompt = `文件名：${file.name}
文件类型：${getFileTypeFromName(file.name)}
文件大小：${(file.size / 1024).toFixed(2)} KB

文件内容：
${truncatedText}

${customTags.length > 0 ? `用户指定的标签：${customTags.join(", ")}` : ""}

请根据文件内容生成高质量的知识卡片。`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      schema: CardsResponseSchema,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("从文件生成卡片失败:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "生成失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}
