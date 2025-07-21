import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "@/lib/ai"
import { CardsResponseSchema } from "@/lib/schemas"

export async function POST(req: NextRequest) {
  try {
    const { text, mode, customTags } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "请提供学习材料内容" }, { status: 400 })
    }

    const systemPrompt =
      mode === "cards"
        ? `你是一个专业的学习助手。请从用户提供的学习材料中提取一个最重要的核心知识点，生成一张知识卡片。

要求：
1. 只生成一张卡片，选择最核心的知识点
2. 标题要简洁明确（不超过15字）
3. 内容要准确完整，包含关键信息（50-150字）
4. 生成一个相关的测试问题和标准答案
5. 根据知识点复杂程度设置难度等级（easy/medium/hard）
6. 添加2-4个合适的标签分类

返回格式要求：
- title: 卡片标题
- content: 知识点详细内容
- question: 测试问题
- answer: 标准答案
- tags: 标签数组
- difficulty: 难度等级

请确保生成的内容准确、有用，适合学习和复习。`
        : `你是一个专业的学习助手。请从用户提供的学习材料中生成一个问答形式的知识卡片。

要求：
1. 只生成一张卡片，选择最适合提问的知识点
2. 问题要有挑战性和实用性
3. 答案要准确完整，包含必要解释（50-150字）
4. 根据问题难度设置等级（easy/medium/hard）
5. 添加2-4个合适的标签分类

返回格式要求：
- title: 基于问题的简洁标题
- content: 相关知识点内容
- question: 测试问题
- answer: 详细答案
- tags: 标签数组
- difficulty: 难度等级

请确保生成的问答有助于检验学习效果。`

    const userPrompt = `学习材料：
${text}

${customTags.length > 0 ? `用户指定的标签：${customTags.join(", ")}` : ""}

请生成知识卡片。`

    const { object } = await generateObject({
      model: "qwen-turbo",
      system: systemPrompt,
      prompt: userPrompt,
      schema: CardsResponseSchema,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("生成卡片失败:", error)
    return NextResponse.json({ error: "生成失败，请稍后重试" }, { status: 500 })
  }
}
