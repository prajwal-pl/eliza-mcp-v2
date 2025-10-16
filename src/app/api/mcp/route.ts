import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ELIZA_CLOUD_MCP_URL = "http://localhost:3000/api/mcp";

async function proxyToElizaCloud(req: NextRequest) {
  try {
    const headers = new Headers();

    req.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "host" &&
        key.toLowerCase() !== "connection" &&
        key.toLowerCase() !== "content-length"
      ) {
        headers.set(key, value);
      }
    });

    const body = req.method !== "GET" ? await req.text() : undefined;

    const response = await fetch(ELIZA_CLOUD_MCP_URL, {
      method: req.method,
      headers,
      body,
      duplex: "half",
    } as RequestInit);

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    if (response.headers.get("content-type")?.includes("text/event-stream")) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: "proxy_error",
        message:
          error instanceof Error ? error.message : "Failed to proxy request",
        target: ELIZA_CLOUD_MCP_URL,
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyToElizaCloud(req);
}

export async function POST(req: NextRequest) {
  return proxyToElizaCloud(req);
}

export async function DELETE(req: NextRequest) {
  return proxyToElizaCloud(req);
}
