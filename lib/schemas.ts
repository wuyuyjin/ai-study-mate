
import { z } from "zod";

export const CardsResponseSchema = z.object({
    cards: z.array(
        z.object({
            id: z.string().optional(),
            title: z.string(),
            content: z.string(),
            question: z.string().optional(),
            answer: z.string().optional(),
            tags: z.array(z.string()).optional(),
        }),
    ),
}); 