import { z } from "zod";

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

    // Assuming the Qwen-Turbo will return a JSON string in the 'text' field of the first choice.
    // The exact path might vary, you might need to adjust `data.output.choices[0].message.content`
    // based on actual Dashscope API response for text generation.
    // For now, let's assume it's data.output.text as commonly seen in their generation API.
    const generatedText = data.output.text;
    let parsedObject;
    try {
        parsedObject = JSON.parse(generatedText);
    } catch (parseError: any) {
        throw new Error(`Failed to parse AI response as JSON: ${generatedText}. Error: ${parseError.message}`);
    }

    const validationResult = schema.safeParse(parsedObject);

    if (!validationResult.success) {
        throw new Error(`AI response validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }

    return { object: validationResult.data };
} 