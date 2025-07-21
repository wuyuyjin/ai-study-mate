import { z } from "zod";

// 解析结构化文本为JSON对象
function parseStructuredText(text: string): any {
    console.log('开始解析结构化文本:', text);
    const cards: any[] = [];

    // 按空行分割，每个部分是一张卡片
    const cardBlocks = text.split('\n\n').filter(block => block.trim());
    console.log('分割后的卡片块数量:', cardBlocks.length);

    for (let i = 0; i < cardBlocks.length; i++) {
        const block = cardBlocks[i];
        console.log(`处理第 ${i + 1} 个卡片块:`, block);

        const card: any = {};
        const lines = block.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const trimmedLine = line.trim();
            // 处理带 "- " 前缀的格式
            const cleanLine = trimmedLine.startsWith('- ') ? trimmedLine.substring(2) : trimmedLine;

            if (cleanLine.startsWith('title:')) {
                card.title = cleanLine.substring(6).trim();
            } else if (cleanLine.startsWith('content:')) {
                card.content = cleanLine.substring(8).trim();
            } else if (cleanLine.startsWith('question:')) {
                card.question = cleanLine.substring(9).trim();
            } else if (cleanLine.startsWith('answer:')) {
                card.answer = cleanLine.substring(7).trim();
            } else if (cleanLine.startsWith('tags:')) {
                const tagsStr = cleanLine.substring(5).trim();
                // 解析 [tag1, tag2, tag3] 或 ["tag1", "tag2", "tag3"] 格式
                if (tagsStr.startsWith('[') && tagsStr.endsWith(']')) {
                    const tagsContent = tagsStr.slice(1, -1);
                    card.tags = tagsContent.split(',').map(tag => tag.trim().replace(/['"]/g, ''));
                } else {
                    card.tags = [tagsStr];
                }
            } else if (cleanLine.startsWith('difficulty:')) {
                const difficultyStr = cleanLine.substring(11).trim();
                // 移除可能的句号
                card.difficulty = difficultyStr.replace(/\.$/, '');
            }
        }

        console.log('解析后的卡片:', card);

        // 确保必要字段存在
        if (card.title && card.content) {
            cards.push({
                title: card.title,
                content: card.content,
                question: card.question || "",
                answer: card.answer || "",
                tags: card.tags || [],
                difficulty: card.difficulty || "medium"
            });
        } else {
            console.log('卡片缺少必要字段，跳过:', { title: card.title, content: card.content });
        }
    }

    console.log('最终解析的卡片数量:', cards.length);

    // 只返回第一张卡片
    const result = cards.length > 0 ? { cards: [cards[0]] } : { cards: [] };
    console.log('返回的卡片:', result);
    return result;
}

export async function generateObject({
    model,
    system,
    prompt,
    schema,
}: {
    model: string;
    system: string;
    prompt: string;
    schema: z.ZodObject<any>;
}) {
    const response = await fetch(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + process.env.DASHSCOPE_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                input: {
                    messages: [
                        {
                            role: 'system',
                            content: system
                        },
                        {
                            role: 'user',
                            content: prompt,
                        }
                    ],
                },
                parameters: {
                    // Add any necessary parameters here based on Qwen-Turbo documentation
                },
            }),
        },
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Dashscope API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // 获取AI生成的文本
    const generatedText = data.output.text;

    // 尝试解析为JSON，如果失败则尝试解析结构化文本
    let parsedObject;
    try {
        // 首先尝试直接解析JSON
        parsedObject = JSON.parse(generatedText);
    } catch (parseError: any) {
        // 如果不是JSON，尝试解析结构化文本
        try {
            parsedObject = parseStructuredText(generatedText);
        } catch (structuredError: any) {
            throw new Error(`Failed to parse AI response: ${generatedText}. JSON Error: ${parseError.message}. Structured Error: ${structuredError.message}`);
        }
    }

    const validationResult = schema.safeParse(parsedObject);

    if (!validationResult.success) {
        throw new Error(`AI response validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }

    return { object: validationResult.data };
} 