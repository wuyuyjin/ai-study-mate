export interface FileMessage {
    role: "system" | "cache";
    content: string;
}

/**
 * 上传文件到 Moonshot AI 并获取文件内容
 * @param fileBuffer 文件的 Buffer 数据
 * @param fileName 文件名
 * @param cacheTag 可选的缓存标签
 * @returns 文件消息数组
 */
export async function uploadFileToMoonshot(
    fileBuffer: Buffer, 
    fileName: string, 
    cacheTag?: string
): Promise<FileMessage[]> {
    const apiKey = process.env.MOONSHOT_DEMO_API_KEY;
    if (!apiKey) {
        throw new Error('MOONSHOT_DEMO_API_KEY 环境变量未设置');
    }

    const messages: FileMessage[] = [];

    // 1. 上传文件
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), fileName);
    formData.append('purpose', 'file-extract');

    const uploadResponse = await fetch('https://api.moonshot.cn/v1/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`文件上传失败: ${JSON.stringify(errorData)}`);
    }

    const fileObject = await uploadResponse.json();

    // 2. 获取文件内容
    const contentResponse = await fetch(`https://api.moonshot.cn/v1/files/${fileObject.id}/content`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (!contentResponse.ok) {
        const errorData = await contentResponse.json();
        throw new Error(`获取文件内容失败: ${JSON.stringify(errorData)}`);
    }

    const fileContent = await contentResponse.text();
    messages.push({
        role: "system",
        content: fileContent,
    });
    
    // 3. 如果设置了缓存标签，创建缓存
    if (cacheTag) {
        const cacheResponse = await fetch('https://api.moonshot.cn/v1/caching', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "moonshot-v1",
                messages: messages,
                ttl: 300,
                tags: [cacheTag],
            }),
        });

        if (!cacheResponse.ok) {
            const errorData = await cacheResponse.json();
            throw new Error(`创建缓存失败: ${JSON.stringify(errorData)}`);
        }
        
        // 返回缓存引用
        return [{
            role: "cache",
            content: `tag=${cacheTag};reset_ttl=300`,
        }];
    } else {
        return messages;
    }
}

/**
 * 使用 Moonshot AI 进行聊天对话
 * @param messages 消息数组，包括文件消息和用户消息
 * @param model 使用的模型，默认为 moonshot-v1-128k
 * @returns AI 的回复内容
 */
export async function chatWithMoonshot(
    messages: Array<{role: string; content: string}>, 
    model: string = "moonshot-v1-128k"
): Promise<string> {
    const apiKey = process.env.MOONSHOT_DEMO_API_KEY;
    if (!apiKey) {
        throw new Error('MOONSHOT_DEMO_API_KEY 环境变量未设置');
    }

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Moonshot AI 请求失败: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || "";
}

/**
 * 从文件生成学习卡片的完整流程
 * @param fileBuffer 文件 Buffer
 * @param fileName 文件名
 * @param customTags 自定义标签
 * @returns 生成的卡片数据
 */
export async function generateCardsFromFileWithMoonshot(
    fileBuffer: Buffer,
    fileName: string,
    customTags: string[] = []
): Promise<any> {
    // 1. 上传文件并获取内容
    const fileMessages = await uploadFileToMoonshot(
        fileBuffer, 
        fileName, 
        `upload_${Date.now()}` // 使用时间戳作为缓存标签
    );

    // 2. 构建对话消息
    const messages = [
        ...fileMessages,
        {
            role: "system",
            content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。现在请根据上传的文件内容生成学习卡片。"
        },
        {
            role: "user",
            content: `请根据文件内容生成3-8个高质量的学习卡片。每个卡片应该包含：
1. 标题（title）
2. 内容（content）
3. 问题（question）
4. 答案（answer）
5. 标签（tags）
6. 难度（difficulty: easy/medium/hard）

${customTags.length > 0 ? `用户指定的标签：${customTags.join(", ")}` : ""}

请以JSON格式返回，格式如下：
{
  "cards": [
    {
      "title": "卡片标题",
      "content": "卡片内容",
      "question": "问题",
      "answer": "答案",
      "tags": ["标签1", "标签2"],
      "difficulty": "medium"
    }
  ]
}`
        }
    ];

    // 3. 调用 Moonshot AI 生成卡片
    const response = await chatWithMoonshot(messages);
    
    // 4. 解析响应
    try {
        const parsedResponse = JSON.parse(response);
        return parsedResponse;
    } catch (error) {
        // 如果不是标准JSON，尝试提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                throw new Error(`无法解析AI响应: ${response}`);
            }
        }
        throw new Error(`AI响应格式错误: ${response}`);
    }
}
