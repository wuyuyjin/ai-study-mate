import { z } from "zod";

// 解析问答格式的文本
function parseQAFormat(text: string): any {
    console.log('使用问答格式解析');

    // 提取标题
    const titleMatch = text.match(/\*\*知识卡片：([^*]+)\*\*/);
    const title = titleMatch ? titleMatch[1].trim() : "知识卡片";

    // 提取问题 - 从"**问题：**"到下一个"---"或"**"
    const questionMatch = text.match(/\*\*问题：\*\*\s*([\s\S]*?)(?=---|$)/);
    const question = questionMatch ? questionMatch[1].trim() : "";

    // 提取答案 - 从"**答案：**"到下一个"---"或"**标签"
    const answerMatch = text.match(/\*\*答案：\*\*\s*([\s\S]*?)(?=---|$|\*\*标签)/);
    const answer = answerMatch ? answerMatch[1].trim() : "";

    // 提取标签 - 从"**标签分类：**"到文本结尾
    const tagsMatch = text.match(/\*\*标签分类：\*\*\s*([\s\S]*?)$/);;
    let tags: string[] = [];
    if (tagsMatch) {
        tags = tagsMatch[1].split('#').filter(tag => tag.trim()).map(tag => tag.trim());
    }

    const card = {
        title: title,
        content: answer, // 使用答案作为内容
        question: question,
        answer: answer,
        tags: tags,
        difficulty: "medium"
    };

    console.log('解析出的问答卡片:', card);

    return { cards: [card] };
}

// 解析结构化文本为JSON对象
function parseStructuredText(text: string): any {
    console.log('开始解析结构化文本:', text);
    const cards: any[] = [];

    // 尝试不同的解析策略

    // 策略1: 寻找明确的卡片结构
    if (text.includes('**问题：**') && text.includes('**答案：**')) {
        console.log('检测到问答格式，使用问答解析策略');
        return parseQAFormat(text);
    }

    // 策略2: 按空行分割，每个部分是一张卡片
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
        // 尝试从文本中提取JSON部分
        console.log('尝试从文本中提取JSON:', generatedText);
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                parsedObject = JSON.parse(jsonMatch[0]);
                console.log('成功提取JSON:', parsedObject);
            } catch (extractError: any) {
                console.log('JSON提取失败，尝试结构化文本解析');
                // 如果JSON提取失败，尝试解析结构化文本
                try {
                    parsedObject = parseStructuredText(generatedText);
                } catch (structuredError: any) {
                    throw new Error(`Failed to parse AI response: ${generatedText}. JSON Error: ${parseError.message}. Extract Error: ${extractError.message}. Structured Error: ${structuredError.message}`);
                }
            }
        } else {
            // 如果找不到JSON，尝试解析结构化文本
            try {
                parsedObject = parseStructuredText(generatedText);
            } catch (structuredError: any) {
                throw new Error(`Failed to parse AI response: ${generatedText}. JSON Error: ${parseError.message}. Structured Error: ${structuredError.message}`);
            }
        }
    }

    const validationResult = schema.safeParse(parsedObject);

    if (!validationResult.success) {
        throw new Error(`AI response validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }

    return { object: validationResult.data };
} 