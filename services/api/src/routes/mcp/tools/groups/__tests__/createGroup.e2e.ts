import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { type Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createGroupToolTask } from "../createGroup.tool.js";

describe("MCP CREATE_GROUP Tool", () => {
  let Test: AppTest;
  let avatar: Media;
  beforeAll(async () => {
    Test = await GetAppTest();

    avatar = fc.sample(MediaArb, 1)[0];

    await throwTE(Test.ctx.db.save(MediaEntity, [avatar].map(toMediaEntity)));
  });

  test("Should create a new group with required fields", async () => {
    const newGroupData = {
      name: "Test MCP Group",
      username: "test-mcp-group",
      color: "FF5733",
      kind: "Public" as const,
      excerpt: "A test group created via MCP tools",
      body: undefined,
      avatar: avatar.id,
      startDate: new Date().toISOString(),
      endDate: undefined,
    };

    const result = await pipe(
      createGroupToolTask(newGroupData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content.text).toContain(newGroupData.name);
    expect(content).toHaveProperty("href");
    expect(content.href).toMatch(/^group:\/\//);
  });

  test("Should create group with optional fields", async () => {
    const newGroupData = {
      name: "Complete Test Group",
      username: "complete-test-group",
      color: "00FF00",
      kind: "Private" as const,
      excerpt: "A complete test group",
      body: "This is a detailed description of the test group.",
      startDate: "2020-01-01",
      endDate: "2023-12-31",
      avatar: undefined,
    };

    const result = await pipe(
      createGroupToolTask(newGroupData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should reject requests without token", async () => {
    const newGroupData = {
      name: "Unauthorized Group",
      username: "unauthorized-group",
      color: "FF0000",
      kind: "Public" as const,
      excerpt: "This should fail",
    };

    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "createGroup",
        arguments: newGroupData,
      },
    };

    const response = await Test.req
      .post("/mcp")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);

    expect(response.status).toBe(401);
  });

  test("Should reject requests with invalid token", async () => {
    const newGroupData = {
      name: "Invalid Token Group",
      username: "invalid-token-group",
      color: "0000FF",
      kind: "Public" as const,
      excerpt: "This should also fail",
    };

    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "createGroup",
        arguments: newGroupData,
      },
    };

    const response = await Test.req
      .post("/mcp")
      .set("Authorization", "Bearer invalid-token-12345")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);

    expect(response.status).toBe(401);
  });
});
