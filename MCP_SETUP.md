# MCP Inspector Proxy

A lightweight MCP Inspector proxy for **eliza-cloud-v2**, allowing you to test and interact with the production MCP server through the official MCP Inspector UI.

## 🎯 Architecture

This project acts as a **transparent proxy** that forwards MCP requests from `localhost:3001` to the real eliza-cloud-v2 backend at `localhost:3000`.

```
MCP Inspector UI
    ↓
localhost:3001/api/mcp (this proxy)
    ↓
localhost:3000/api/mcp (eliza-cloud-v2 backend)
    ↓
Real AI generation, credit system, database
```

**Benefits:**
- Test real MCP tools without mock data
- Use production authentication and credit system
- Access actual AI generation capabilities
- Stream real responses from GPT-4, Claude, Gemini

## 🚀 Quick Start

### Prerequisites

1. **eliza-cloud-v2 must be running** on `localhost:3000`
   ```bash
   cd ../eliza-cloud-v2
   npm run dev
   ```

2. **Get an API key** from eliza-cloud-v2:
   - Visit http://localhost:3000
   - Login with Privy
   - Go to Dashboard → API Keys
   - Create new API key
   - Copy the key (format: `eliza_xxxxx`)

### Setup This Proxy

1. **Start the proxy server**:
   ```bash
   npm run dev
   ```
   Runs on: `http://localhost:3001`

2. **Launch MCP Inspector**:
   ```bash
   npm run mcp:inspector
   ```

3. **Configure Inspector**:
   - **Transport Type**: `Streamable HTTP`
   - **URL**: `http://localhost:3001/api/mcp`
   - **Connection Type**: `Via Proxy`
   - **Paste Session Token**: Copy from inspector UI
   - **Authentication**:
     - Click "Add Header"
     - Header Name: `Authorization`
     - Header Value: `Bearer eliza_your_api_key_here`
   - Click **Connect**

## 🛠 Available Tools (from eliza-cloud-v2)

### 1. check_credits

View your organization's credit balance and transaction history.

**Parameters:**
- `includeTransactions` (boolean, optional): Include recent transactions
- `limit` (number, optional, 1-20, default: 5): Number of transactions

**Example:**
```json
{
  "includeTransactions": true,
  "limit": 5
}
```

**Response:**
```json
{
  "balance": 10000,
  "organizationId": "org-123",
  "organizationName": "Your Organization",
  "transactions": [...]
}
```

### 2. get_recent_usage

Get real API usage statistics from your organization.

**Parameters:**
- `limit` (number, optional, 1-50, default: 10): Number of usage records

**Example:**
```json
{
  "limit": 10
}
```

**Response:**
```json
{
  "usage": [...],
  "summary": {
    "totalRecords": 10,
    "totalCost": 150
  }
}
```

### 3. generate_text

**Real AI text generation** using GPT-4, Claude, or Gemini.

**Parameters:**
- `prompt` (string, required): Text prompt
- `model` (enum, optional, default: "gpt-4o"):
  - `gpt-4o`
  - `gpt-4o-mini`
  - `claude-3-5-sonnet-20241022`
  - `gemini-2.0-flash-exp`
- `maxLength` (number, optional, 1-4000, default: 1000): Max response length

**Example:**
```json
{
  "prompt": "Explain the MCP protocol",
  "model": "gpt-4o",
  "maxLength": 500
}
```

**Cost:** Token-based pricing, automatically deducted from credits

### 4. generate_image

**Real image generation** using Google Gemini 2.5 Flash.

**Parameters:**
- `prompt` (string, required): Image description
- `aspectRatio` (enum, optional, default: "1:1"):
  - `1:1` - Square (1024x1024)
  - `16:9` - Wide landscape
  - `9:16` - Tall portrait
  - `4:3` - Landscape
  - `3:4` - Portrait

**Example:**
```json
{
  "prompt": "A serene mountain landscape at sunset",
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "message": "Image generated successfully",
  "url": "https://blob.vercel-storage.com/...",
  "aspectRatio": "16:9",
  "cost": 100,
  "newBalance": 9900
}
```

**Cost:** 100 credits per image

## 📂 Project Structure

```
eliza-mcp-v2/
├── src/
│   └── app/
│       └── api/
│           └── mcp/
│               └── route.ts          # Proxy handler (75 lines)
├── package.json
└── MCP_SETUP.md
```

**That's it!** No mock implementations, no complex logic - just a transparent proxy.

## 🔧 How It Works

The proxy:

1. Receives MCP requests at `localhost:3001/api/mcp`
2. Forwards all headers (including `Authorization`)
3. Proxies to `localhost:3000/api/mcp`
4. Streams responses back (supports SSE)
5. Handles errors gracefully

**Code:**
```typescript
const response = await fetch("http://localhost:3000/api/mcp", {
  method: req.method,
  headers: filteredHeaders,
  body: requestBody,
});
```

## 🎓 Testing Workflow

### 1. Test Authentication
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

Expected: List of 4 tools

### 2. Check Your Credits
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "check_credits",
    "arguments": {
      "includeTransactions": true,
      "limit": 3
    }
  }
}
```

### 3. Generate Text (Uses Credits!)
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "generate_text",
    "arguments": {
      "prompt": "Write a haiku about programming",
      "model": "gpt-4o-mini"
    }
  }
}
```

### 4. Generate Image (Uses 100 Credits!)
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "generate_image",
    "arguments": {
      "prompt": "A futuristic city at night",
      "aspectRatio": "16:9"
    }
  }
}
```

## 🔐 Authentication

The proxy passes through authentication headers to eliza-cloud-v2:

**Method 1: MCP Inspector Headers**
- Add `Authorization: Bearer eliza_your_key` in inspector UI

**Method 2: CLI Testing**
```bash
curl -X POST 'http://localhost:3001/api/mcp' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'Authorization: Bearer eliza_your_key' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 📊 Real Data Access

When you use this proxy, you're interacting with:

- **Real Database**: PostgreSQL with credit transactions, usage records
- **Real AI APIs**: OpenAI, Anthropic, Google via AI SDK Gateway
- **Real Storage**: Vercel Blob for generated images
- **Real Billing**: Credits are actually deducted
- **Real Analytics**: Usage tracked in dashboard

## 🎨 Customization

### Change Backend URL

Edit `src/app/api/mcp/route.ts`:
```typescript
const ELIZA_CLOUD_MCP_URL = "https://your-production-url.com/api/mcp";
```

### Add Request Logging

```typescript
console.log(`[Proxy] ${req.method} ${req.url}`);
console.log(`[Proxy] Auth: ${req.headers.get('authorization')?.substring(0, 20)}...`);
```

### Add Response Transformation

```typescript
const responseBody = await response.text();
const data = JSON.parse(responseBody);

// Transform if needed
data.proxied = true;

return NextResponse.json(data, {
  status: response.status,
  headers: responseHeaders,
});
```

## 🔗 Integration with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "eliza-cloud": {
      "url": "http://localhost:3001/api/mcp",
      "transport": {
        "type": "streamableHttp"
      },
      "headers": {
        "Authorization": "Bearer eliza_your_api_key_here"
      }
    }
  }
}
```

Restart Claude Desktop and you'll see eliza-cloud tools available!

## 🐛 Troubleshooting

### Proxy Error 502

**Issue:** Cannot connect to backend

**Solution:**
```bash
# Check if eliza-cloud-v2 is running
curl http://localhost:3000/api/mcp

# Start backend
cd ../eliza-cloud-v2 && npm run dev
```

### Unauthorized Error

**Issue:** Missing or invalid API key

**Solutions:**
1. Get API key from http://localhost:3000/dashboard/api-keys
2. Add to MCP Inspector headers: `Authorization: Bearer eliza_your_key`
3. Verify key format: `eliza_` prefix + 32 characters

### Tools List Empty

**Issue:** Authentication working but no tools shown

**Solution:** Backend may not have initialized. Check eliza-cloud-v2 logs.

### Credits Not Deducting

**Issue:** This is the backend's responsibility

**Solution:** Check eliza-cloud-v2 database and credit system

## 📚 Resources

- [eliza-cloud-v2 README](../eliza-cloud-v2/README.md)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 💡 Use Cases

1. **Testing**: Test MCP tools without modifying backend
2. **Development**: Develop MCP clients against real server
3. **Debugging**: Debug MCP protocol issues with inspector
4. **Demo**: Show MCP capabilities to stakeholders
5. **Learning**: Learn MCP protocol with real implementations

## 🚢 Deployment

This proxy is designed for local development. For production:

1. Deploy eliza-cloud-v2 to Vercel
2. Update `ELIZA_CLOUD_MCP_URL` to production URL
3. Deploy this proxy or use eliza-cloud-v2 directly

**Note:** In production, clients should connect directly to eliza-cloud-v2's MCP endpoint.

## ⚡ Performance

- **Latency**: ~10-50ms overhead from proxy layer
- **Streaming**: Supports SSE, no buffering
- **Concurrent**: Handles multiple simultaneous requests
- **Memory**: Minimal (~10MB)

## 📄 License

Based on eliza-cloud-v2 architecture.
