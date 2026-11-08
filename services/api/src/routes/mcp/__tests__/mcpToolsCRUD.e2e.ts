import * as IO from "fp-ts/lib/IO.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { createAgentServiceClient } from "../../../utils/serviceClientTokenGenerator.js";

/**
 * Helper to send an MCP tool call request and return the parsed response.
 * Follows the MCP protocol: initialize, then initialize notification, then tool call.
 */
async function callMcpTool(
  Test: AppTest,
  token: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  // Step 1: Initialize the MCP server
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0",
      },
    },
  };

  const initResponse = await Test.req
    .post("/mcp")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json, text/event-stream")
    .send(initRequest);

  expect([401, 403]).not.toContain(initResponse.status);

  // Extract session ID from the response header
  const sessionId = initResponse.headers["mcp-session-id"] as string | undefined;
  expect(sessionId).toBeDefined();
  expect(typeof sessionId).toBe("string");

  // Step 2: Send initialized notification with session ID
  const notifRequest = {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  };

  await Test.req
    .post("/mcp")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json, text/event-stream")
    .set("mcp-session-id", sessionId!)
    .send(notifRequest);

  // Step 3: Call the tool with session ID
  const toolRequest = {
    jsonrpc: "2.0",
    id: Math.floor(Math.random() * 100000),
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args,
    },
  };

  const response = await Test.req
    .post("/mcp")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json, text/event-stream")
    .set("mcp-session-id", sessionId!)
    .send(toolRequest);

  // Authentication should pass (not 401/403)
  expect([401, 403]).not.toContain(response.status);

  if (response.status !== 200) {
    Test.ctx.logger.debug.log(`Tool ${toolName} response status:`, response.status);
    Test.ctx.logger.debug.log("Response body:", response.body);
  }

  // Parse the JSON-RPC response
  const body = response.body as Record<string, unknown>;
  if (body.error) {
    throw new Error(
      `MCP tool ${toolName} error: ${JSON.stringify(body.error)}`,
    );
  }

  const resultBody = body.result as Record<string, unknown> | undefined;
  const content = resultBody?.content as Array<{ text?: string; type?: string }>;
  if (!content || content.length === 0) {
    throw new Error(`MCP tool ${toolName} returned no content`);
  }

  const text = content[0].text;
  if (typeof text !== "string") {
    throw new Error(`MCP tool ${toolName} returned non-string content`);
  }

  // If the text looks like an error message, handle it gracefully
  if (text.startsWith("Failed to") || text.startsWith("Error:")) {
    throw new Error(`MCP tool ${toolName} returned error: ${text}`);
  }

  return JSON.parse(text);
}

describe("MCP CRUD Tools E2E Tests", () => {
  let Test: AppTest;
  let serviceClientToken: string;

  beforeAll(async () => {
    Test = await GetAppTest();

    const { token } = pipe(
      createAgentServiceClient({ jwt: Test.ctx.jwt }),
      IO.chainFirst((result) =>
        IO.of(
          Test.ctx.logger.debug.log(
            "Created service client for CRUD tests:",
            result.serviceClient.id,
          ),
        ),
      ),
    )();

    serviceClientToken = token;
  });

  // ============================================================
  // Actors CRUD
  // ============================================================
  describe("Actors CRUD", () => {
    test("findActors - returns paginated results", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "findActors", {});
      expect(result).toHaveProperty("actors");
      expect(Array.isArray(result.actors)).toBe(true);
      expect(result).toHaveProperty("total");
      expect(typeof result.total).toBe("number");
    });

    test("findActors - validates input schema (invalid sort field)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "findActors", {
          sort: "invalidField",
        }),
      ).rejects.toThrow();
    });

    test("createActor - validates input schema (missing required fields)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "createActor", {}),
      ).rejects.toThrow();
    });

    test("editActor - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editActor", {
          fullName: "No ID actor",
        }),
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // Groups CRUD
  // ============================================================
  describe("Groups CRUD", () => {
    test("findGroups - returns paginated results", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "findGroups", {});
      expect(result).toHaveProperty("groups");
      expect(Array.isArray(result.groups)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    test("findGroups - validates input schema (invalid sort field)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "findGroups", {
          sort: "invalidField",
        }),
      ).rejects.toThrow();
    });

    test("createGroup - validates input schema (missing required fields)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "createGroup", {}),
      ).rejects.toThrow();
    });

    test("editGroup - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editGroup", {
          name: "No ID group",
        }),
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // Events CRUD
  // ============================================================
  describe("Events CRUD", () => {
    test("findEvents - returns paginated results", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "findEvents", {});
      expect(result).toHaveProperty("events");
      expect(Array.isArray(result.events)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    test("createEvent - validates input schema (missing required fields)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "createEvent", {}),
      ).rejects.toThrow();
    });

    test("editEvent - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editEvent", {
          name: "No ID event",
        }),
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // Links CRUD
  // ============================================================
  describe("Links CRUD", () => {
    test("findLinks - returns paginated results", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "findLinks", {});
      expect(result).toHaveProperty("links");
      expect(Array.isArray(result.links)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    test("findLinks - validates input schema (invalid sort)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "findLinks", {
          sort: "invalidField",
        }),
      ).rejects.toThrow();
    });

    test("createLink - validates input schema (missing url)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "createLink", {}),
      ).rejects.toThrow();
    });

    test("editLink - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editLink", {
          title: "No ID link",
        }),
      ).rejects.toThrow();
    });
  });
});
