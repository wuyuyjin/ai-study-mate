import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { generateObject } from "@/lib/ai"
import { z } from "zod"
import prisma from "@/lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 获取当前用户ID的辅助函数
async function getCurrentUserId(req: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.userId
  } catch (error) {
    return null
  }
}

// 定义分析结果的schema
const AnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  analysis: z.array(z.object({
    questionNumber: z.number(),
    title: z.string(),
    question: z.string(),
    userAnswer: z.string(),
    standardAnswer: z.string(),
    isCorrect: z.boolean(),
    score: z.number().min(0).max(10),
    feedback: z.string(),
    keyPoints: z.array(z.string()),
    suggestions: z.string().optional(),
  })),
  overallFeedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { questions } = await req.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "无效的测验数据" }, { status: 400 })
    }

    // 构建AI分析提示
    const analysisPrompt = `请分析以下记忆测验的结果，对比用户答案与标准答案。这是一个记忆测验，用户凭记忆回答问题，请给予鼓励性的反馈：

测验题目和答案：
${questions.map((q: any, index: number) => `
题目 ${index + 1}：
标题：${q.title}
问题：${q.question}
标准答案：${q.standardAnswer}
用户答案：${q.userAnswer || "未回答"}
难度：${q.difficulty}
`).join('\n')}

请提供详细的分析，要求：
1. 仔细评判每道题的正确性：
   - 如果用户答案包含标准答案的核心要点，即使表达不同也应判定为正确(isCorrect: true)
   - 如果用户答案部分正确或相关，可以给予部分分数但判定为不完全正确(isCorrect: false)
   - 如果用户答案完全错误或未回答，判定为错误(isCorrect: false)
2. 评分要宽松鼓励，但正确性判断要准确
3. 即使答案不完全正确，如果包含关键要点也应给予较高分数
4. 提供鼓励性的反馈和建设性建议
5. 重点表扬用户的努力和已掌握的知识点

返回严格的JSON格式，不要包含任何其他文本。特别注意isCorrect字段要准确反映答案的正确性。`

    const systemPrompt = `你是一个专业的学习评估专家。请客观、详细地分析学生的测验表现，提供有价值的反馈和建议。

必须返回严格的JSON格式，包含以下字段：
{
  "overallScore": 数字(0-100),
  "totalQuestions": 数字,
  "correctAnswers": 数字,
  "analysis": [
    {
      "questionNumber": 数字,
      "title": "字符串",
      "question": "字符串",
      "userAnswer": "字符串",
      "standardAnswer": "字符串",
      "isCorrect": 布尔值,
      "score": 数字(0-10),
      "feedback": "字符串",
      "keyPoints": ["字符串数组"],
      "suggestions": "字符串(可选)"
    }
  ],
  "overallFeedback": "字符串",
  "strengths": ["字符串数组"],
  "weaknesses": ["字符串数组"],
  "recommendations": ["字符串数组"]
}

确保分析客观、有建设性，能帮助学生改进学习。不要返回Markdown格式，只返回纯JSON。`

    // 调用AI进行分析
    const result = await generateObject({
      model: "qwen-turbo",
      system: systemPrompt,
      prompt: analysisPrompt,
      schema: AnalysisSchema,
    })

    // 更新卡片的复习次数
    try {
      const updatePromises = questions.map(async (question: any) => {
        // 找到对应的分析结果
        const analysis = result.object.analysis.find(
          (a: any) => a.questionNumber === question.questionNumber
        )

        if (analysis && question.id) {
          // 更新复习次数，所有参与测验的卡片都增加复习次数
          await prisma.studyCard.update({
            where: { id: question.id },
            data: {
              reviewCount: {
                increment: 1
              },
              // 如果答对了，可以更新最后复习时间
              ...(analysis.isCorrect && {
                updatedAt: new Date()
              })
            }
          })
        }
      })

      await Promise.all(updatePromises)
      console.log('复习次数更新成功')
    } catch (updateError) {
      console.error('更新复习次数失败:', updateError)
      // 不影响主要功能，继续返回分析结果
    }

    return NextResponse.json({
      success: true,
      analysis: result.object,
      completedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("分析测验结果失败:", error)
    return NextResponse.json({
      error: "分析失败，请稍后重试",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
