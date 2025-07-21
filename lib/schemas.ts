
import { z } from "zod";

export const CardsResponseSchema = z.object({
    cards: z.array(
        z.object({
            id: z.string().optional(),
            title: z.string(),
            content: z.string(),
            question: z.string(),
            answer: z.string(),
            tags: z.array(z.string()).default([]),
            difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        }),
    ).max(1), // 最多只返回一张卡片
});