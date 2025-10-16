# MCP Inspector Proxy for eliza-cloud-v2

A lightweight transparent proxy that enables MCP Inspector to connect to the real eliza-cloud-v2 backend.

## What This Does

This project forwards MCP protocol requests from `localhost:3001` to eliza-cloud-v2 at `localhost:3000`, allowing you to:

- Test real MCP tools with actual AI generation
- Use production authentication and credit system
- Inspect MCP protocol traffic with the official inspector UI
- Access GPT-4, Claude, Gemini through MCP protocol

## Quick Start

1. **Start eliza-cloud-v2 backend**:
   ```bash
   cd ../eliza-cloud-v2
   npm run dev  # Runs on localhost:3000
   ```

2. **Get API key** from http://localhost:3000/dashboard/api-keys

3. **Start this proxy**:
   ```bash
   npm run dev  # Runs on localhost:3001
   ```

4. **Launch MCP Inspector**:
   ```bash
   npm run mcp:inspector
   ```

5. **Configure Inspector**:
   - URL: `http://localhost:3001/api/mcp`
   - Transport: `Streamable HTTP`
   - Connection: `Via Proxy`
   - Add header: `Authorization: Bearer eliza_your_key`

## Available Tools

All 4 tools from eliza-cloud-v2:

1. **check_credits** - View balance and transactions
2. **get_recent_usage** - API usage statistics
3. **generate_text** - Real AI text generation (GPT-4, Claude, Gemini)
4. **generate_image** - Real image generation (Gemini 2.5)

## Architecture

```
MCP Inspector → localhost:3001/api/mcp (proxy) → localhost:3000/api/mcp (backend)
```

Simple, transparent, no logic duplication.

## Documentation

See [MCP_SETUP.md](./MCP_SETUP.md) for detailed setup and usage.

## Dependencies

- `next@15.5.5` - Next.js framework
- `@modelcontextprotocol/sdk@^1.20.0` - MCP protocol
- `mcp-handler@^1.0.3` - Handler library

## Project Structure

```
src/
└── app/
    └── api/
        └── mcp/
            └── route.ts    # 75 lines - just proxy logic
```

## License

Based on eliza-cloud-v2 architecture.
