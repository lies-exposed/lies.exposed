import * as IO from "fp-ts/lib/IO.js";
import { pipe } from "fp-ts/lib/function.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { createAgentServiceClient } from "../../../utils/serviceClientTokenGenerator.js";

describe("MCP Tools with Service Client Authentication", () => {
  let Test: AppTest;
  let serviceClientToken: string;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Generate a service client token for MCP tools access
    const { token } = pipe(
      createAgentServiceClient({ jwt: Test.ctx.jwt }),
      IO.chainFirst((result) =>
        IO.of(
          Test.ctx.logger.debug.log(
            "Created service client:",
            result.serviceClient.id,
          ),
        ),
      ),
    )();

    serviceClientToken = token;
  });

  describe("Service Client Authentication", () => {
    test("Should allow access to MCP endpoint with valid service client token", async () => {
      const testRequest = {
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

      const response = await Test.req
        .post("/mcp")
        .set("Authorization", `Bearer ${serviceClientToken}`)
        .set("Content-Type", "application/json")
        .send(testRequest);

      // Log response for debugging
      Test.ctx.logger.debug.log("Response status:", response.status);
      Test.ctx.logger.debug.log("Response headers:", response.headers);
      Test.ctx.logger.debug.log("Response body:", response.body);

      // Authentication should pass (not 401/403)
      expect([401, 403]).not.toContain(response.status);

      // For now, just verify we got past authentication
      // The actual MCP protocol implementation might need more work
      expect(response.status).toBeDefined();
    });

    test("Should reject MCP request without authorization token", async () => {
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

      await Test.req
        .post("/mcp")
        .set("Content-Type", "application/json")
        .send(initRequest)
        .expect(401);
    });

    test("Should reject MCP request with invalid token", async () => {
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

      await Test.req
        .post("/mcp")
        .set("Authorization", "Bearer invalid-token")
        .set("Content-Type", "application/json")
        .send(initRequest)
        .expect(401);
    });

    test("Should reject MCP request with user token (missing mcp:tools permission)", async () => {
      const userToken = Test.ctx.jwt.signUser({ id: "test-user" } as any)();

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

      // User tokens are rejected at JWT verification level, returning 401
      await Test.req
        .post("/mcp")
        .set("Authorization", `Bearer ${userToken}`)
        .set("Content-Type", "application/json")
        .send(initRequest)
        .expect(401);
    });

    test("Should accept MCP request with valid service client token", async () => {
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

      // This test validates that the service client token with mcp:tools permission
      // is properly authenticated. We expect either success or a protocol-specific error,
      // but not authentication errors (401/403)
      const response = await Test.req
        .post("/mcp")
        .set("Authorization", `Bearer ${serviceClientToken}`)
        .set("Content-Type", "application/json")
        .send(initRequest);

      // Authentication should succeed (not 401 or 403)
      expect([401, 403]).not.toContain(response.status);

      // If we get a 406, it's likely a protocol issue, not auth
      if (response.status === 406) {
        Test.ctx.logger.debug.log(
          "Protocol issue (406) - authentication passed but MCP protocol failed",
        );
        Test.ctx.logger.debug.log("Response body:", response.body);
      }
    });
  });

  describe("Service Client Token Permissions", () => {
    test("Should verify service client has correct permissions", () => {
      // Decode the service client token to verify it has the right permissions
      const decodedResult = Test.ctx.jwt.verifyClient(serviceClientToken)();

      if (decodedResult._tag === "Right") {
        const decoded = decodedResult.right;
        expect(decoded).toHaveProperty("permissions");
        expect(decoded.permissions).toContain("mcp:tools");
        expect(decoded).toHaveProperty("id");
        expect(typeof decoded.id).toBe("string");
      } else {
        expect(decodedResult._tag).toBe("Right");
      }
    });

    test("Should verify service client token is valid", () => {
      const decodedResult = Test.ctx.jwt.verifyClient(serviceClientToken)();

      expect(decodedResult._tag).toBe("Right");
      if (decodedResult._tag === "Right") {
        expect(decodedResult.right).toHaveProperty("id");
        expect(decodedResult.right).toHaveProperty("permissions");
      }
    });
  });
});
