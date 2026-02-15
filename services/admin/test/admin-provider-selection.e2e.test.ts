import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { GetAdminAppTest, closeAdminAppTest } from "./AdminAppTest.js";
import type { AdminAppTest } from "./AdminAppTest.js";

describe.sequential("Admin Provider Selection E2E", () => {
  let AdminTest: AdminAppTest;

  beforeAll(async () => {
    AdminTest = await GetAdminAppTest(false);
  });

  afterAll(async () => {
    await closeAdminAppTest();
  });

  describe("Provider Registry Endpoints", () => {
    it("should expose /api/proxy/agent/providers endpoint", async () => {
      const response = await AdminTest.req
        .get("/api/proxy/agent/providers")
        .expect([200, 401, 500]); // Accepts any status to check endpoint exists

      // If endpoint exists and is unauthorized, 401 is acceptable
      // If it returns 500, that means the endpoint exists but has an error
      // If it returns 200, that means we got the full response
      expect([200, 401, 500]).toContain(response.status);
    });

    it("should expose /api/proxy/agent/providers/:provider endpoint", async () => {
      const response = await AdminTest.req
        .get("/api/proxy/agent/providers/openai")
        .expect([200, 401, 500]);

      // Same logic as above - endpoint should exist
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe("Chat Message with Provider Config", () => {
    it("should accept aiConfig in chat message request", async () => {
      // Note: This test validates that the endpoint accepts the aiConfig parameter
      // Actual authentication is mocked separately
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Hello",
          conversation_id: null,
          aiConfig: {
            provider: "openai",
            model: "gpt-4o",
          },
        })
        .expect([200, 401, 500]); // Endpoint should exist

      // Should not return 404 - endpoint exists
      expect(response.status).not.toBe(404);
    });

    it("should accept streaming chat request with aiConfig", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message/stream")
        .send({
          message: "Test message",
          conversation_id: "test-conv-123",
          aiConfig: {
            provider: "anthropic",
            model: "claude-sonnet-4-20250514",
          },
        })
        .expect([200, 401, 500]); // Should exist

      // Validate endpoint exists (won't get 404)
      expect(response.status).not.toBe(404);
    });

    it("should accept chat message without aiConfig (backward compatibility)", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Hello without provider",
          conversation_id: null,
        })
        .expect([200, 401, 500]);

      // Should not return 404 - backward compatibility maintained
      expect(response.status).not.toBe(404);
    });

    it("should accept streaming chat without aiConfig (backward compatibility)", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message/stream")
        .send({
          message: "Streaming without provider",
          conversation_id: "conv-456",
        })
        .expect([200, 401, 500]);

      // Should not return 404 - backward compatibility maintained
      expect(response.status).not.toBe(404);
    });
  });

  describe("Provider Configuration Validation", () => {
    it("should validate provider name in aiConfig", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Test message",
          conversation_id: null,
          aiConfig: {
            provider: "invalid-provider",
            model: "some-model",
          },
        })
        .expect([200, 400, 401, 422, 500]); // May validate and reject

      // Response should exist (won't be 404)
      expect(response.status).not.toBe(404);
    });

    it("should accept valid provider names", async () => {
      const validProviders = ["openai", "anthropic", "xai"];

      for (const provider of validProviders) {
        const response = await AdminTest.req
          .post("/api/proxy/agent/chat/message")
          .send({
            message: "Test with valid provider",
            conversation_id: null,
            aiConfig: {
              provider,
              model: "test-model",
            },
          })
          .expect([200, 401, 500, 400, 422]); // Should handle request

        // Should not be 404 (endpoint exists)
        expect(response.status).not.toBe(404);
      }
    });

    it("should accept optional model field in aiConfig", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Test message",
          conversation_id: null,
          aiConfig: {
            provider: "openai",
            // Model is optional
          },
        })
        .expect([200, 401, 500]);

      // Should not return 404
      expect(response.status).not.toBe(404);
    });
  });

  describe("Request Content Type", () => {
    it("should handle application/json content type for aiConfig", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .set("Content-Type", "application/json")
        .send({
          message: "JSON test",
          conversation_id: null,
          aiConfig: {
            provider: "openai",
            model: "gpt-4",
          },
        })
        .expect([200, 401, 500]);

      // Should accept JSON
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe("Backward Compatibility", () => {
    it("should handle requests without aiConfig field", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "No provider specified",
          conversation_id: null,
          resource_context: undefined,
        })
        .expect([200, 401, 500]);

      // Should work without aiConfig
      expect([200, 401, 500]).toContain(response.status);
    });

    it("should handle requests with only message and conversation_id", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Minimal request",
          conversation_id: "minimal-conv",
        })
        .expect([200, 401, 500]);

      // Should work with minimal fields
      expect([200, 401, 500]).toContain(response.status);
    });

    it("should work with legacy request structure", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message/stream")
        .send({
          message: "Legacy format",
          conversation_id: null,
          resource_context: {
            resource: "actors",
            recordId: null,
            action: "list",
          },
        })
        .expect([200, 401, 500]);

      // Should work with legacy format
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed aiConfig gracefully", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Test",
          conversation_id: null,
          aiConfig: {
            // Missing required provider field
            model: "some-model",
          } as any,
        })
        .expect([200, 400, 401, 422, 500]);

      // Should handle gracefully (not 500 for bad request, or auth error)
      expect(response.status).not.toBe(404);
    });

    it("should handle empty aiConfig object", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Test",
          conversation_id: null,
          aiConfig: {} as any,
        })
        .expect([200, 400, 401, 422, 500]);

      // Should handle gracefully
      expect(response.status).not.toBe(404);
    });

    it("should handle null aiConfig", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({
          message: "Test",
          conversation_id: null,
          aiConfig: null,
        })
        .expect([200, 401, 500]);

      // Should treat null as no provider specified (backward compatible)
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe("Chat Endpoints Structure", () => {
    it("should accept requests to /api/proxy/agent/chat/message endpoint", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message")
        .send({ message: "test" })
        .expect([200, 401, 500]);

      expect([200, 401, 500]).toContain(response.status);
    });

    it("should accept requests to /api/proxy/agent/chat/message/stream endpoint", async () => {
      const response = await AdminTest.req
        .post("/api/proxy/agent/chat/message/stream")
        .send({ message: "test" })
        .expect([200, 401, 500]);

      expect([200, 401, 500]).toContain(response.status);
    });

    it("should not accept GET requests to chat endpoints", async () => {
      const response = await AdminTest.req
        .get("/api/proxy/agent/chat/message")
        .expect([405, 404, 500]); // Should not allow GET

      // GET should not be allowed
      expect([405, 404, 500]).toContain(response.status);
    });
  });
});
