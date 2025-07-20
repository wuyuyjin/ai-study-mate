import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const CardSchema = z.object({
  title: z.string().describe("知识点的标题"),
  tags: z.array(z.string()).describe("相关标签"),
  content: z.string().describe("知识点的详细内容"),
  qa: z.object({
    question: z.string().describe("测试问题"),
    answer: z.string().describe("标准答案"),
  }),
})

const CardsResponseSchema = z.object({
  cards: z.array(CardSchema),
})

export async function POST(req: NextRequest) {
  try {
    const { text, mode, customTags } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "请提供学习材料内容" }, { status: 400 })
    }

    const systemPrompt =
      mode === "cards"
        ? `你是一个专业的学习助手。请将用户提供的学习材料转换为结构化的知识卡片。

要求：
1. 提取3-5个核心知识点
2. 每个知识点生成一张卡片
3. 标题要简洁明确
4. 内容要准确完整，包含关键信息
5. 生成相关的测试问答
6. 添加合适的标签分类

请确保生成的内容准确、有用，适合学习和复习。`
        : `你是一个专业的学习助手。请将用户提供的学习材料转换为问答形式的知识卡片。

要求：
1. 重点关注可以提问的知识点
2. 生成3-5个问答卡片
3. 问题要有挑战性和实用性
4. 答案要准确完整
5. 添加合适的标签分类

请确保生成的问答有助于检验学习效果。`

    const userPrompt = `学习材料：
${text}

${customTags.length > 0 ? `用户指定的标签：${customTags.join(", ")}` : ""}

请生成知识卡片。`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
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
