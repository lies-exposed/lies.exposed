import http from "http";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { type UserEncoded } from "@liexp/io/lib/http/User.js";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  GetAgentTest,
  type AgentAppTest,
  startAppServer,
  stopAppServer,
} from "../../../../test/AppTest.js";

/**
 * E2E tests for chat controller routes
 *
 * Tests the following endpoints:
 * - POST /v1/chat/message - Send chat message
 * - POST /v1/chat/message/stream - Stream chat message (SSE)
 * - GET /v1/chat/conversations - List conversations
 * - GET /v1/chat/conversations/:id - Get conversation
 * - DELETE /v1/chat/conversations/:id - Delete conversation
 */

/**
 * Helper to create a test user payload for JWT signing
 * Note: The JWT provider signs UserEncoded but verifies against AuthUser schema
 */
const createTestUser = (): UserEncoded => ({
  id: uuid(), // Valid UUID format
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  email: "test@example.com",
  status: "Approved",
  permissions: ["admin:read"],
  telegramId: null,
  telegramToken: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

describe("Chat Controller E2E", () => {
  let Test: AgentAppTest;
  let authToken: string;

  beforeAll(async () => {
    Test = await GetAgentTest();
    // Generate a valid JWT token for testing (signUser returns IO.IO<string>)
    authToken = Test.ctx.jwt.signUser(createTestUser())();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /v1/chat/message", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await Test.req.post("/v1/chat/message").send({
        message: "Hello",
        conversation_id: null,
      });

      expect(response.status).toBe(401);
    });

    it("should create a new conversation and return response", async () => {
      const response = await Test.req
        .post("/v1/chat/message")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          message: "Hello, this is a test message",
          conversation_id: null,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.conversationId).toBeDefined();
      expect(response.body.data.message).toBeDefined();
      expect(response.body.data.message.role).toBe("assistant");
      expect(response.body.data.message.content).toBeDefined();
    });

    it("should continue an existing conversation", async () => {
      // First message to create conversation
      const firstResponse = await Test.req
        .post("/v1/chat/message")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "First message",
          conversation_id: null,
        });

      expect(firstResponse.status).toBe(200);
      const conversationId = firstResponse.body.data.conversationId;

      // Second message in same conversation
      const secondResponse = await Test.req
        .post("/v1/chat/message")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          message: "Second message",
          conversation_id: conversationId,
        });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.data.conversationId).toBe(conversationId);
    });

    it("should accept resource_context in request", async () => {
      const response = await Test.req
        .post("/v1/chat/message")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          message: "Help with this actor",
          conversation_id: null,
          resource_context: {
            resource: "actors",
            recordId: "actor-123",
            action: "edit",
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /v1/chat/conversations", () => {
    it("should return list of conversations", async () => {
      const response = await Test.req.get("/v1/chat/conversations");

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeDefined();
    });

    it("should accept limit and offset query params", async () => {
      const response = await Test.req
        .get("/v1/chat/conversations")
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /v1/chat/conversations/:id", () => {
    it("should return conversation by id", async () => {
      // First create a conversation
      const createResponse = await Test.req
        .post("/v1/chat/message")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          message: "Test message for get",
          conversation_id: null,
        });

      const conversationId = createResponse.body.data.conversationId;

      // Then get it
      const response = await Test.req.get(
        `/v1/chat/conversations/${conversationId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(conversationId);
      expect(response.body.data.messages).toBeDefined();
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });

    it("should return empty messages for non-existent conversation", async () => {
      const response = await Test.req.get(
        "/v1/chat/conversations/non-existent-id",
      );

      expect(response.status).toBe(200);
      expect(response.body.data.messages).toEqual([]);
    });
  });

  describe("DELETE /v1/chat/conversations/:id", () => {
    it("should delete conversation by id", async () => {
      // First create a conversation
      const createResponse = await Test.req
        .post("/v1/chat/message")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          message: "Test message for delete",
          conversation_id: null,
        });

      const conversationId = createResponse.body.data.conversationId;

      // Delete it
      const deleteResponse = await Test.req.delete(
        `/v1/chat/conversations/${conversationId}`,
      );

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data).toBe(true);

      // Verify it's gone
      const getResponse = await Test.req.get(
        `/v1/chat/conversations/${conversationId}`,
      );

      expect(getResponse.body.data.messages).toEqual([]);
    });

    it("should return false for non-existent conversation", async () => {
      const response = await Test.req.delete(
        "/v1/chat/conversations/non-existent-id",
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(false);
    });
  });

  describe("POST /v1/chat/message/stream", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await Test.req.post("/v1/chat/message/stream").send({
        message: "Hello",
        conversation_id: null,
      });

      expect(response.status).toBe(401);
    });

    it("should stream SSE events when authenticated", async () => {
      const response = await Test.req
        .post("/v1/chat/message/stream")
        .set("authorization", `Bearer ${authToken}`)
        .set("Accept", "text/event-stream")
        .send({
          message: "Stream test message",
          conversation_id: null,
        });

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/event-stream");

      // Parse SSE response
      const sseData = response.text;
      expect(sseData).toContain(": connected");
      expect(sseData).toContain("data:");
      expect(sseData).toContain("[DONE]");

      // Parse individual events
      const dataLines = sseData
        .split("\n")
        .filter(
          (line: string) =>
            line.startsWith("data:") && !line.includes("[DONE]"),
        );

      expect(dataLines.length).toBeGreaterThan(0);

      // Check that events have proper structure
      for (const line of dataLines) {
        const jsonStr = line.replace("data: ", "");
        const event = JSON.parse(jsonStr);

        expect(event.type).toBeDefined();
        expect(event.timestamp).toBeDefined();
        expect([
          "message_start",
          "content_delta",
          "tool_call_start",
          "tool_call_end",
          "message_end",
          "error",
        ]).toContain(event.type);
      }
    });

    it("should include message_start and message_end events", async () => {
      const response = await Test.req
        .post("/v1/chat/message/stream")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          message: "Test for events",
          conversation_id: null,
        });

      const sseData = response.text;
      const dataLines = sseData
        .split("\n")
        .filter(
          (line: string) =>
            line.startsWith("data:") && !line.includes("[DONE]"),
        );

      const events = dataLines.map((line: string) =>
        JSON.parse(line.replace("data: ", "")),
      );

      const eventTypes = events.map((e: any) => e.type);

      expect(eventTypes).toContain("message_start");
      expect(eventTypes).toContain("message_end");
    });

    it("should use provided conversation_id", async () => {
      const conversationId = "stream-test-conv-123";

      const response = await Test.req
        .post("/v1/chat/message/stream")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          message: "Stream with conversation id",
          conversation_id: conversationId,
        });

      expect(response.status).toBe(200);

      // Verify conversation was created
      const getResponse = await Test.req.get(
        `/v1/chat/conversations/${conversationId}`,
      );

      expect(getResponse.body.data.messages.length).toBeGreaterThan(0);
    });

    it("streams SSE incrementally (real-time)", async () => {
      const { server, port } = await startAppServer(Test.ctx);

      const chunks: string[] = [];

      await new Promise<void>((resolve, reject) => {
        const req = http.request(
          {
            method: "POST",
            port,
            path: "/v1/chat/message/stream",
            headers: {
              authorization: `Bearer ${authToken}`,
              Accept: "text/event-stream",
              "Content-Type": "application/json",
            },
          },
          (res: any) => {
            res.setEncoding("utf8");

            res.on("data", (chunk: string) => {
              // collect raw chunks
              chunks.push(chunk);
            });

            res.on("end", async () => {
              try {
                await stopAppServer(server);
                resolve();
              } catch (err) {
                await stopAppServer(server);
                reject(err as Error);
              }
            });

            res.on("error", async (err: Error) => {
              await stopAppServer(server);
              reject(err);
            });
          },
        );

        req.on("error", (err: Error) => {
          void stopAppServer(server).finally(() => reject(err));
        });

        req.write(
          JSON.stringify({
            message: "stream incremental test",
            conversation_id: null,
          }),
        );
        req.end();
      });

      const full = chunks.join("");

      // Quick sanity checks
      expect(full).toContain(": connected");
      expect(full).toContain("[DONE]");

      // Extract all `data: ...` payloads using regex
      const dataPayloads: string[] = [];
      const re = /^data:\s*(.+)$/gim;
      let m: RegExpExecArray | null;
      while ((m = re.exec(full)) !== null) {
        dataPayloads.push(m[1]);
      }

      // Filter out DONE markers and empty payloads, then parse JSON
      const parsed = dataPayloads
        .filter((p) => p && p !== "[DONE]")
        .map((p) => JSON.parse(p));

      // Assert we received incremental events including start/end
      const types = parsed.map((p: any) => p.type);
      expect(types).toEqual(
        expect.arrayContaining(["message_start", "message_end"]),
      );
    });
  });

  describe("GET /v1/healthcheck", () => {
    it("should return healthy status", async () => {
      const response = await Test.req.get("/v1/healthcheck");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body.service).toBe("agent");
    });
  });
});
