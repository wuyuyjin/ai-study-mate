import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "@/lib/ai"
import { CardsResponseSchema } from "@/lib/schemas"

// 简单的网页内容提取函数
async function fetchWebContent(url: string): Promise<{ title: string; content: string }> {
  try {
    // 验证URL格式
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      throw new Error("无效的网页链接格式")
    }

    // 检查协议
    if (!["http:", "https:"].includes(validUrl.protocol)) {
      throw new Error("仅支持HTTP和HTTPS协议")
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // 简单的HTML内容提取
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : "网页内容"

    // 移除HTML标签，提取文本内容
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 移除script标签
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 移除style标签
      .replace(/<[^>]+>/g, ' ') // 移除所有HTML标签
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim()

    // 限制内容长度
    if (content.length > 8000) {
      content = content.substring(0, 8000) + "..."
    }

    if (!content || content.length < 50) {
      throw new Error("无法提取有效的网页内容")
    }

    return { title, content }
  } catch (error) {
    console.error("网页内容提取失败:", error)
    throw error instanceof Error ? error : new Error("网页内容提取失败")
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, mode, customTags } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "请提供网页链接" }, { status: 400 })
    }

    // 获取网页内容
    const webContent = await fetchWebContent(url)

    // 构建系统提示
    const systemPrompt = mode === "cards"
      ? `你是一个专业的学习助手。请从用户提供的网页内容中提取一个最重要的核心知识点，生成一张知识卡片。

要求：
1. 重点关注可以提问的知识点
2. 生成1张高质量的知识卡片
3. 问题要有挑战性和实用性
4. 答案要准确完整，包含必要的解释
5. 添加合适的标签分类

请严格按照以下JSON格式返回：
{
  "cards": [
    {
      "title": "卡片标题",
      "content": "知识内容",
      "question": "测试问题",
      "answer": "问题答案",
      "tags": ["标签1", "标签2"],
      "difficulty": "medium"
    }
  ]
}

请确保返回的是有效的JSON格式，不要包含任何其他文本。`
      : `你是一个专业的学习助手。请从用户提供的网页内容中提取重要知识点，生成多张知识卡片。

要求：
1. 重点关注可以提问的知识点
2. 根据内容复杂度生成3-8个问答卡片
3. 问题要有挑战性和实用性，涵盖不同难度层次
4. 答案要准确完整，包含必要的解释
5. 添加合适的标签分类
6. 问题类型要多样化：概念理解、应用分析、对比总结等

请严格按照以下JSON格式返回：
{
  "cards": [
    {
      "title": "卡片标题",
      "content": "知识内容",
      "question": "测试问题",
      "answer": "问题答案",
      "tags": ["标签1", "标签2"],
      "difficulty": "medium"
    }
  ]
}

请确保返回的是有效的JSON格式，不要包含任何其他文本。`

    const userPrompt = `网页标题：${webContent.title}
网页链接：${url}

网页内容：
${webContent.content}

${customTags && customTags.length > 0 ? `用户指定的标签：${customTags.join(", ")}` : ""}

请根据网页内容生成高质量的知识卡片，严格按照JSON格式返回，不要包含任何其他文本。`

    const { object } = await generateObject({
      model: "qwen-turbo",
      system: systemPrompt,
      prompt: userPrompt,
      schema: CardsResponseSchema,
    })

    // 确保返回的卡片数据有效
    if (!object.cards || object.cards.length === 0) {
      throw new Error("AI未能生成有效的知识卡片，请尝试其他网页或稍后重试")
    }

    return NextResponse.json(object)
  } catch (error) {
    console.error("从网页生成卡片失败:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "生成失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}
