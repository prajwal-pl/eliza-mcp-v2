import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  CheckCreditsInputSchema,
  GetRecentUsageInputSchema,
  GenerateTextInputSchema,
  GenerateImageInputSchema,
  type CheckCreditsInput,
  type GetRecentUsageInput,
  type GenerateTextInput,
  type GenerateImageInput,
} from "./types";

export function registerTools(server: McpServer) {
  server.tool(
    "check_credits",
    "Check credit balance and recent transactions for your organization",
    CheckCreditsInputSchema.shape,
    async ({ includeTransactions = false, limit = 5 }: CheckCreditsInput) => {
      try {
        const response: {
          balance: number;
          organizationId: string;
          organizationName: string;
          transactions?: Array<{
            id: string;
            amount: number;
            type: string;
            description: string;
            createdAt: string;
          }>;
        } = {
          balance: 10000,
          organizationId: "demo-org-123",
          organizationName: "Demo Organization",
        };

        if (includeTransactions) {
          response.transactions = Array.from({ length: limit }, (_, i) => ({
            id: `tx-${i + 1}`,
            amount: i % 2 === 0 ? 100 : -50,
            type: i % 2 === 0 ? "purchase" : "deduction",
            description:
              i % 2 === 0
                ? "Credit pack purchase"
                : "Text generation usage",
            createdAt: new Date(
              Date.now() - i * 86400000
            ).toISOString(),
          }));
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to check credits",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_recent_usage",
    "Get recent API usage statistics including models used, costs, and tokens",
    GetRecentUsageInputSchema.shape,
    async ({ limit = 10 }: GetRecentUsageInput) => {
      try {
        const models = ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet-20241022"];
        const types = ["chat", "image"];

        const usageRecords = Array.from({ length: limit }, (_, i) => ({
          id: `usage-${i + 1}`,
          type: types[i % 2],
          model: models[i % 3],
          provider: i % 3 === 0 ? "openai" : i % 3 === 1 ? "openai" : "anthropic",
          inputTokens: Math.floor(Math.random() * 1000) + 100,
          outputTokens: Math.floor(Math.random() * 500) + 50,
          inputCost: Math.floor(Math.random() * 10) + 1,
          outputCost: Math.floor(Math.random() * 5) + 1,
          totalCost: 0,
          isSuccessful: i % 10 !== 0,
          errorMessage: i % 10 === 0 ? "Rate limit exceeded" : null,
          createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        }));

        usageRecords.forEach((record) => {
          record.totalCost = record.inputCost + record.outputCost;
        });

        const totalCost = usageRecords.reduce(
          (sum, record) => sum + record.totalCost,
          0
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  usage: usageRecords,
                  summary: {
                    totalRecords: usageRecords.length,
                    totalCost,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to fetch usage",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "generate_text",
    "Generate text using AI models (GPT-4, Claude, Gemini). This is a demo version that returns mock responses.",
    GenerateTextInputSchema.shape,
    async ({ prompt, model = "gpt-4o", maxLength = 1000 }: GenerateTextInput) => {
      try {
        const mockResponses: Record<string, string> = {
          "gpt-4o": `[GPT-4o Mock Response]\n\nYour prompt: "${prompt}"\n\nThis is a demonstration response from the MCP inspector. In a production environment, this would connect to the actual ${model} API and generate real content based on your prompt.\n\nKey features:\n- Streaming support\n- Token counting\n- Cost tracking\n- Error handling\n\nTo enable real generation, integrate with AI SDK Gateway or direct provider APIs.`,
          "gpt-4o-mini": `[GPT-4o-mini Mock Response]\n\nPrompt received: "${prompt}"\n\nThis lightweight model would provide faster, cost-effective responses for simpler tasks. Mock response demonstrates the structure and format.`,
          "claude-3-5-sonnet-20241022": `[Claude 3.5 Sonnet Mock Response]\n\nAnalyzing prompt: "${prompt}"\n\nClaude's response would emphasize thoughtful, nuanced answers with strong reasoning capabilities. This demo shows the integration pattern.`,
          "gemini-2.0-flash-exp": `[Gemini 2.0 Flash Mock Response]\n\nProcessing: "${prompt}"\n\nGoogle's Gemini would provide multimodal capabilities and fast inference. This is a structural demonstration.`,
        };

        const response = mockResponses[model] || mockResponses["gpt-4o"];
        const truncated = response.substring(0, Math.min(maxLength, response.length));

        return {
          content: [
            {
              type: "text" as const,
              text: truncated,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error:
                    error instanceof Error
                      ? error.message
                      : "Text generation failed",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "generate_image",
    "Generate images using Google Gemini 2.5. This is a demo version that returns mock image URLs.",
    GenerateImageInputSchema.shape,
    async ({ prompt, aspectRatio = "1:1" }: GenerateImageInput) => {
      try {
        const aspectRatioDescriptions: Record<string, string> = {
          "1:1": "square composition",
          "16:9": "wide landscape composition",
          "9:16": "tall portrait composition",
          "4:3": "landscape composition",
          "3:4": "portrait composition",
        };

        const mockImageUrl = `https://placehold.co/1024x1024/png?text=${encodeURIComponent(
          prompt.substring(0, 50)
        )}`;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  message: "Image generation demo - mock response",
                  prompt,
                  aspectRatio,
                  description: aspectRatioDescriptions[aspectRatio],
                  mockImageUrl,
                  note: "In production, this would generate a real image using Google Gemini 2.5 and upload to Vercel Blob storage",
                  estimatedCost: 100,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error:
                    error instanceof Error
                      ? error.message
                      : "Image generation failed",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
