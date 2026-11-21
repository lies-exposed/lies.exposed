import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toActorEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
import * as IO from "fp-ts/lib/IO.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import {
  createAgentServiceClient,
  createServiceClientTokenWithUserId,
} from "../../../utils/serviceClientTokenGenerator.js";

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
  // The endpoint is stateless: no initialize handshake or session is needed.
  // A stale `mcp-session-id` (e.g. from before an API restart) must be ignored.
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
    .set("mcp-session-id", "stale-session-id-from-before-restart")
    .send(toolRequest);

  // Authentication should pass (not 401/403)
  expect([401, 403]).not.toContain(response.status);

  if (response.status !== 200) {
    Test.ctx.logger.debug.log(
      `Tool ${toolName} response status:`,
      response.status,
    );
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
  const content = resultBody?.content as readonly {
    text?: string;
    type?: string;
  }[];
  if (!content || content.length === 0) {
    throw new Error(`MCP tool ${toolName} returned no content`);
  }

  const text = content[0].text;
  if (typeof text !== "string") {
    throw new Error(`MCP tool ${toolName} returned non-string content`);
  }

  // If the text looks like an error message, handle it gracefully
  if (
    text.startsWith("Failed to") ||
    text.startsWith("Error:") ||
    text.startsWith("MCP error")
  ) {
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
  describe("Stateless transport", () => {
    test("initialize returns no session and tools/list works without one", async () => {
      const headers = {
        Authorization: `Bearer ${serviceClientToken}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      };
      const init = await Test.req
        .post("/mcp")
        .set(headers)
        .send({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test-client", version: "1.0.0" },
          },
        });
      expect(init.status).toBe(200);
      expect(init.headers["mcp-session-id"]).toBeUndefined();

      const list = await Test.req
        .post("/mcp")
        .set(headers)
        .set("mcp-session-id", "stale-session-id")
        .send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
      expect(list.status).toBe(200);
      expect(
        (list.body as { result: { tools: unknown[] } }).result.tools.length,
      ).toBeGreaterThan(0);
    });

    test("GET /mcp is not allowed (no SSE sessions)", async () => {
      const res = await Test.req
        .get("/mcp")
        .set("Authorization", `Bearer ${serviceClientToken}`);
      expect(res.status).toBe(405);
    });
  });

  describe("Actors CRUD", () => {
    test("findActors - returns paginated results", async () => {
      const result = await callMcpTool(
        Test,
        serviceClientToken,
        "findActors",
        {},
      );
      expect(result).toHaveProperty("actors");
      expect(Array.isArray(result.actors)).toBe(true);
      expect(result).toHaveProperty("total");
      expect(typeof result.total).toBe("number");
    });

    test("findActors - ids filter restricts results to given UUIDs", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "findActors", {
        ids: ["00000000-0000-4000-8000-000000000000"],
      });
      expect(result.actors).toEqual([]);
      expect(result.total).toBe(0);
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
      const result = await callMcpTool(
        Test,
        serviceClientToken,
        "findGroups",
        {},
      );
      expect(result).toHaveProperty("groups");
      expect(Array.isArray(result.groups)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    test("findGroups - ids filter restricts results to given UUIDs", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "findGroups", {
        ids: ["00000000-0000-4000-8000-000000000000"],
      });
      expect(result.groups).toEqual([]);
      expect(result.total).toBe(0);
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

    test("createGroup/editGroup - edit applies fields and string body becomes BlockNote", async () => {
      const suffix = Math.random().toString(36).slice(2, 8);
      const created = (await callMcpTool(
        Test,
        serviceClientToken,
        "createGroup",
        {
          name: `MCP Group ${suffix}`,
          username: `mcp-group-${suffix}`,
          color: "ff0000",
          kind: "Public",
        },
      )) as { group: { id: string } };

      const edited = (await callMcpTool(Test, serviceClientToken, "editGroup", {
        id: created.group.id,
        name: `MCP Group Edited ${suffix}`,
        body: "first\nsecond",
      })) as { group: { name: string; body: unknown } };

      expect(edited.group.name).toBe(`MCP Group Edited ${suffix}`);
      expect(Array.isArray(edited.group.body)).toBe(true);
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
      const result = await callMcpTool(
        Test,
        serviceClientToken,
        "findEvents",
        {},
      );
      expect(result).toHaveProperty("events");
      expect(Array.isArray(result.events)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    test("createEvent - validates input schema (missing required fields)", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "createEvent", {}),
      ).rejects.toThrow();
    });

    test("createEvent - rejects a Death event without victim", async () => {
      await expect(
        callMcpTool(Test, serviceClientToken, "createEvent", {
          type: "Death",
          date: "2024-01-01",
        }),
      ).rejects.toThrow();
    });

    test("createEvent/editEvent - persist the type-specific payload", async () => {
      const [victim, other] = fc.sample(ActorArb, 2).map(toActorEntity);
      await throwTE(Test.ctx.db.save(ActorEntity, [victim, other]));

      const created = (await callMcpTool(
        Test,
        serviceClientToken,
        "createEvent",
        {
          type: "Death",
          date: "2024-01-01",
          victim: victim.id,
          excerpt: "line one\nline two",
        },
      )) as { event: { id: string; payload: { victim: string } } };

      expect(created.event.payload.victim).toBe(victim.id);

      // the event must be really persisted: fetchable by id
      const found = (await callMcpTool(Test, serviceClientToken, "findEvents", {
        ids: [created.event.id],
      })) as { events: { id: string; payload: { victim: string } }[] };
      expect(found.events.map((e) => e.id)).toEqual([created.event.id]);

      // payload edits must not be silently dropped
      const edited = (await callMcpTool(Test, serviceClientToken, "editEvent", {
        id: created.event.id,
        victim: other.id,
      })) as { event: { payload: { victim: string } } };
      expect(edited.event.payload.victim).toBe(other.id);
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
      const result = await callMcpTool(
        Test,
        serviceClientToken,
        "findLinks",
        {},
      );
      expect(result).toHaveProperty("links");
      expect(Array.isArray(result.links)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    test("findLinks - ids filter restricts results to given UUIDs", async () => {
      const result = await callMcpTool(Test, serviceClientToken, "findLinks", {
        ids: ["00000000-0000-4000-8000-000000000000"],
      });
      expect(result.links).toEqual([]);
      expect(result.total).toBe(0);
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

  describe("Media creator attribution", () => {
    test("createMedia - attributes media to the authenticated caller", async () => {
      const user = await saveUser(Test.ctx, ["admin:create"]);
      const { token } = createServiceClientTokenWithUserId(
        "agent",
        ["admin:read", "mcp:tools"],
        user.id,
      )(Test.ctx)();

      Test.mocks.axios.get.mockResolvedValueOnce({
        status: 200,
        data: {},
      });
      Test.mocks.redis.publish.mockResolvedValue(1);

      const id = Math.random().toString(36).slice(2);
      const result = await callMcpTool(Test, token, "createMedia", {
        location: `https://www.youtube.com/watch?v=${id}`,
        type: "iframe/video",
        label: `mcp-${id}`,
      });

      const media = (result.media ?? result) as { creator?: string }[];
      const saved = await Test.ctx.db.manager.findOne(MediaEntity, {
        where: { id: (media[0] as unknown as { id: UUID }).id },
        relations: { creator: true },
      });
      expect(saved?.creator?.id).toBe(user.id);
    });
  });
});
