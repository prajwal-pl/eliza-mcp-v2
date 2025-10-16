# MCP Inspector Setup

A standalone Model Context Protocol (MCP) server implementation for Next.js, based on the proven architecture from eliza-cloud-v2.

## 🎯 Overview

This project provides a lightweight MCP server with 4 demonstration tools:
- **check_credits**: View credit balance and transactions (mock data)
- **get_recent_usage**: API usage statistics (mock data)
- **generate_text**: Text generation demo (mock responses)
- **generate_image**: Image generation demo (mock URLs)

## 🚀 Quick Start

### 1. Install Dependencies

Already installed:
```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Server runs on: `http://localhost:3001`

### 3. Launch MCP Inspector

In a separate terminal:
```bash
npm run mcp:inspector
```

### 4. Configure MCP Inspector

1. **Transport Type**: Select `Streamable HTTP`
2. **URL**: `http://localhost:3001/api/mcp`
3. **Connection Type**: Select `Via Proxy`
4. **Paste Session Token**: Copy from inspector UI
5. Click **Connect**

## 🔧 Architecture

```
src/
├── app/
│   └── api/
│       └── mcp/
│           └── route.ts           # MCP endpoint handler
└── lib/
    └── mcp/
        ├── types.ts               # Zod schemas and types
        └── tools.ts               # Tool implementations
```

## 📝 Available Tools

### check_credits

Check credit balance and recent transactions.

**Parameters:**
- `includeTransactions` (boolean, optional): Include transaction history
- `limit` (number, optional, 1-20, default: 5): Number of transactions

**Example:**
```json
{
  "includeTransactions": true,
  "limit": 5
}
```

### get_recent_usage

Get recent API usage statistics.

**Parameters:**
- `limit` (number, optional, 1-50, default: 10): Number of records

**Example:**
```json
{
  "limit": 10
}
```

### generate_text

Generate text using AI models (demo version).

**Parameters:**
- `prompt` (string, required): Text prompt
- `model` (enum, optional, default: "gpt-4o"): Model choice
  - `gpt-4o`
  - `gpt-4o-mini`
  - `claude-3-5-sonnet-20241022`
  - `gemini-2.0-flash-exp`
- `maxLength` (number, optional, 1-4000, default: 1000): Max response length

**Example:**
```json
{
  "prompt": "Explain MCP protocol",
  "model": "gpt-4o",
  "maxLength": 500
}
```

### generate_image

Generate images (demo version with mock URLs).

**Parameters:**
- `prompt` (string, required): Image description
- `aspectRatio` (enum, optional, default: "1:1"): Aspect ratio
  - `1:1` - Square
  - `16:9` - Wide landscape
  - `9:16` - Tall portrait
  - `4:3` - Landscape
  - `3:4` - Portrait

**Example:**
```json
{
  "prompt": "A serene mountain landscape",
  "aspectRatio": "16:9"
}
```

## 🔨 Development

### Type Checking

```bash
npm run check-types
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## 📦 Dependencies

- `@modelcontextprotocol/sdk@^1.20.0` - MCP protocol implementation
- `mcp-handler@^1.0.3` - Handler library for Next.js routes
- `zod@^3.25.76` - Schema validation (v3 required for MCP SDK)
- `next@15.5.5` - Next.js framework
- `react@19.1.0` - React library

## 🎨 Customization

### Adding New Tools

1. **Define Schema** (`src/lib/mcp/types.ts`):
```typescript
export const MyToolInputSchema = z.object({
  param1: z.string().describe("Description"),
  param2: z.number().optional(),
});

export type MyToolInput = z.infer<typeof MyToolInputSchema>;
```

2. **Implement Tool** (`src/lib/mcp/tools.ts`):
```typescript
server.tool(
  "my_tool",
  "Tool description",
  MyToolInputSchema.shape,
  async ({ param1, param2 }: MyToolInput) => {
    // Your logic here
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ result: "data" }, null, 2),
        },
      ],
    };
  }
);
```

### Adding Authentication

To add API key authentication:

1. Install dependencies:
```bash
npm install bcrypt @types/bcrypt
```

2. Add auth middleware to `src/app/api/mcp/route.ts`:
```typescript
import { NextResponse } from "next/server";

async function handleRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!apiKey || apiKey !== process.env.MCP_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return await mcpHandler(req as unknown as Request);
}
```

3. Set environment variable:
```bash
echo "MCP_API_KEY=your-secret-key" >> .env.local
```

### Connecting to Real AI Services

To enable actual AI generation:

1. Install AI SDK:
```bash
npm install ai @ai-sdk/openai
```

2. Update tool implementation:
```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

// In generate_text tool:
const result = await streamText({
  model: openai(model),
  prompt: prompt,
});

let fullText = "";
for await (const delta of result.textStream) {
  fullText += delta;
}

return {
  content: [{ type: "text" as const, text: fullText }],
};
```

3. Add environment variable:
```bash
echo "OPENAI_API_KEY=sk-..." >> .env.local
```

## 🔗 Integration with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "eliza-mcp": {
      "url": "http://localhost:3001/api/mcp",
      "transport": {
        "type": "streamableHttp"
      }
    }
  }
}
```

With authentication:
```json
{
  "mcpServers": {
    "eliza-mcp": {
      "url": "http://localhost:3001/api/mcp",
      "transport": {
        "type": "streamableHttp"
      },
      "headers": {
        "Authorization": "Bearer your-api-key"
      }
    }
  }
}
```

## 📚 Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎓 Learning Path

1. **Start Here**: Use MCP Inspector to test tools
2. **Add Custom Tools**: Implement tools specific to your use case
3. **Add Authentication**: Secure your MCP server
4. **Connect Real Services**: Integrate with AI APIs, databases, etc.
5. **Deploy**: Deploy to Vercel or other platforms

## 🚢 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Configure environment variables (if using auth or real services)
4. Deploy

Update MCP Inspector URL to production:
```
https://your-app.vercel.app/api/mcp
```

## 🐛 Troubleshooting

### MCP Inspector Won't Connect

- Ensure dev server is running on port 3001
- Check URL is exactly `http://localhost:3001/api/mcp`
- Select "Via Proxy" connection type
- Check browser console for errors

### Type Errors

```bash
npm run check-types
```

### Port Already in Use

Change port in `package.json`:
```json
"dev": "next dev --turbopack -p 3002"
```

Update MCP Inspector URL accordingly.

## 📄 License

Based on eliza-cloud-v2 architecture. See parent project for license details.
