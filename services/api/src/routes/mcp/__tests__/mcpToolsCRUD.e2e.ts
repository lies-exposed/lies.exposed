import * as IO from "fp-ts/lib/IO.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { createAgentServiceClient } from "../../../utils/serviceClientTokenGenerator.js";

/**
 * Helper to send an MCP tool call request and return the parsed response.
 */
async function callMcpTool(
  Test: AppTest,
  token: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const request = {
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
    .send(request);

  // Authentication should pass (not 401/403)
  expect([401, 403]).not.toContain(response.status);

  if (response.status !== 200) {
    // Some non-200 status may still contain useful error info
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

    test("createActor - creates a new actor", async () => {
      const uniqueUsername = `test-actor-${Date.now()}`;
      const result = await callMcpTool(Test, serviceClientToken, "createActor", {
        username: uniqueUsername,
        fullName: `Test Actor ${Date.now()}`,
        color: "ff0000",
        excerpt: "Test actor for E2E tests",
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("string");
      expect(result.username).toBe(uniqueUsername);
      expect(result.fullName).toBe(`Test Actor ${Date.now()}`);
      expect(result.excerpt).toBe("Test actor for E2E tests");
    });

    test("editActor - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editActor", {
          fullName: "No ID actor",
        }),
      ).rejects.toThrow();
    });

    test("editActor - updates an existing actor", async () => {
      // First create an actor to edit
      const uniqueUsername = `test-actor-edit-${Date.now()}`;
      const createResult = await callMcpTool(Test, serviceClientToken, "createActor", {
        username: uniqueUsername,
        fullName: `Original Name ${Date.now()}`,
      });

      const actorId = createResult.id;

      // Now edit it
      const editResult = await callMcpTool(Test, serviceClientToken, "editActor", {
        id: actorId,
        fullName: `Updated Name ${Date.now()}`,
        color: "00ff00",
      });

      expect(editResult.id).toBe(actorId);
      expect(editResult.fullName).toBe(`Updated Name ${Date.now()}`);
      expect(editResult.color).toBe("00ff00");
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

    test("createGroup - creates a new group", async () => {
      const uniqueName = `test-group-${Date.now()}`;
      const result = await callMcpTool(Test, serviceClientToken, "createGroup", {
        name: uniqueName,
        username: `test-group-${Date.now()}`,
        kind: "organization",
        excerpt: "Test group for E2E tests",
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("string");
      expect(result.name).toBe(uniqueName);
    });

    test("editGroup - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editGroup", {
          name: "No ID group",
        }),
      ).rejects.toThrow();
    });

    test("editGroup - updates an existing group", async () => {
      const uniqueName = `test-group-edit-${Date.now()}`;
      const createResult = await callMcpTool(Test, serviceClientToken, "createGroup", {
        name: uniqueName,
        username: `test-group-edit-${Date.now()}`,
      });

      const groupId = createResult.id;

      const editResult = await callMcpTool(Test, serviceClientToken, "editGroup", {
        id: groupId,
        name: `Updated Group ${Date.now()}`,
        color: "0000ff",
      });

      expect(editResult.id).toBe(groupId);
      expect(editResult.name).toBe(`Updated Group ${Date.now()}`);
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

    test("findEvents - validates input schema (invalid type)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "findEvents", {
          type: "invalidType",
        }),
      ).rejects.toThrow();
    });

    test("createEvent - validates input schema (missing required fields)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "createEvent", {}),
      ).rejects.toThrow();
    });

    test("createEvent - creates a new event (Uncategorized type)", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "createEvent", {
        name: `Test Event ${Date.now()}`,
        type: "Uncategorized",
        startDate: new Date().toISOString().split("T")[0],
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("string");
      expect(result.name).toBe(`Test Event ${Date.now()}`);
      expect(result.type).toBe("Uncategorized");
    });

    test("createEvent - creates a Death event with required fields", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "createEvent", {
        name: `Death Event ${Date.now()}`,
        type: "Death",
        startDate: new Date().toISOString().split("T")[0],
        deathDate: new Date().toISOString().split("T")[0],
      });

      expect(result).toHaveProperty("id");
      expect(result.type).toBe("Death");
    });

    test("editEvent - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editEvent", {
          name: "No ID event",
        }),
      ).rejects.toThrow();
    });

    test("editEvent - updates an existing event", async () => {
      const createResult = await callMcpTool(Test, serviceClientToken, "createEvent", {
        name: `Event to Edit ${Date.now()}`,
        type: "Uncategorized",
        startDate: new Date().toISOString().split("T")[0],
      });

      const eventId = createResult.id;

      const editResult = await callMcpTool(Test, serviceClientToken, "editEvent", {
        id: eventId,
        name: `Edited Event ${Date.now()}`,
      });

      expect(editResult.id).toBe(eventId);
      expect(editResult.name).toBe(`Edited Event ${Date.now()}`);
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

    test("createLink - creates a new link", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "createLink", {
        url: `https://example.com/test-link-${Date.now()}`,
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("string");
      expect(result.url).toBe(`https://example.com/test-link-${Date.now()}`);
    });

    test("editLink - validates input schema (missing id)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "editLink", {
          title: "No ID link",
        }),
      ).rejects.toThrow();
    });

    test("editLink - updates an existing link", async () => {
      const createResult = await callMcpTool(Test, serviceClientToken, "createLink", {
        url: `https://example.com/test-link-edit-${Date.now()}`,
      });

      const linkId = createResult.id;

      const editResult = await callMcpTool(Test, serviceClientToken, "editLink", {
        id: linkId,
        title: `Edited Link ${Date.now()}`,
      });

      expect(editResult.id).toBe(linkId);
      expect(editResult.title).toBe(`Edited Link ${Date.now()}`);
    });
  });
});
