import { createMcpHandler } from "mcp-handler";
import { NextRequest } from "next/server";
import { registerTools } from "@/lib/mcp/tools";

export const maxDuration = 60;

const mcpHandler = createMcpHandler(
  (server) => {
    registerTools(server);
  },
  {},
  { basePath: "/api" }
);

async function handleRequest(req: NextRequest) {
  return await mcpHandler(req as unknown as Request);
}

export { handleRequest as GET, handleRequest as POST, handleRequest as DELETE };
