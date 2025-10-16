import { z } from "zod";

export const CheckCreditsInputSchema = z.object({
  includeTransactions: z
    .boolean()
    .optional()
    .describe("Include recent transactions in the response"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(5)
    .describe("Number of recent transactions to include"),
});

export const GetRecentUsageInputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .describe("Number of recent usage records to fetch"),
});

export const GenerateTextInputSchema = z.object({
  prompt: z.string().min(1).describe("The text prompt to generate from"),
  model: z
    .enum([
      "gpt-4o",
      "gpt-4o-mini",
      "claude-3-5-sonnet-20241022",
      "gemini-2.0-flash-exp",
    ])
    .optional()
    .default("gpt-4o")
    .describe("The AI model to use for generation"),
  maxLength: z
    .number()
    .int()
    .min(1)
    .max(4000)
    .optional()
    .default(1000)
    .describe("Maximum length of generated text"),
});

export const GenerateImageInputSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe("Description of the image to generate"),
  aspectRatio: z
    .enum(["1:1", "16:9", "9:16", "4:3", "3:4"])
    .optional()
    .default("1:1")
    .describe("Aspect ratio for the generated image"),
});

export type CheckCreditsInput = z.infer<typeof CheckCreditsInputSchema>;
export type GetRecentUsageInput = z.infer<typeof GetRecentUsageInputSchema>;
export type GenerateTextInput = z.infer<typeof GenerateTextInputSchema>;
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;
