import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { toGroupEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { editGroupToolTask } from "../editGroup.tool.js";

describe("MCP EDIT_GROUP Tool", () => {
  let Test: AppTest;
  let groupToEdit: GroupEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create a specific group to edit
    groupToEdit = toGroupEntity({
      ...fc.sample(GroupArb, 1)[0],
      name: "Group To Edit",
      username: "group-to-edit",
      color: toColor("AABBCC"),
      kind: "Public" as any,
      excerpt: toInitialValue("Original excerpt"),
      avatar: undefined,
      members: [],
    });

    await throwTE(Test.ctx.db.save(GroupEntity, [groupToEdit]));
  });

  test("Should edit group name", async () => {
    const result = await pipe(
      editGroupToolTask({
        id: groupToEdit.id,
        username: "group-to-edit",
        color: groupToEdit.color,
        excerpt: isValidValue(groupToEdit.excerpt)
          ? getTextContents(groupToEdit.excerpt)
          : undefined,
        kind: groupToEdit.kind,
        members: groupToEdit.members.map((m) => m.id),
        name: "Updated Group Name",
        body: undefined,
        avatar: undefined,
        startDate: new Date().toISOString(),
        endDate: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content.text).toContain("Updated Group Name");
  });

  test("Should edit multiple fields at once", async () => {
    const result = await pipe(
      editGroupToolTask({
        id: groupToEdit.id,
        name: "Multi-Field Update",
        color: "FF0000",
        kind: "Private",
        excerpt: "Updated excerpt text",
        username: "multi-field-update",
        members: groupToEdit.members.map((m) => m.id),
        body: undefined,
        avatar: undefined,
        startDate: new Date().toISOString(),
        endDate: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content.text).toContain("Multi-Field Update");
  });

  test("Should update body content", async () => {
    const result = await pipe(
      editGroupToolTask({
        id: groupToEdit.id,
        body: "This is the updated body content with more details.",
        username: groupToEdit.username ?? undefined,
        members: groupToEdit.members.map((m) => m.id),
        name: groupToEdit.name,
        color: groupToEdit.color,
        kind: groupToEdit.kind,
        excerpt: isValidValue(groupToEdit.excerpt)
          ? getTextContents(groupToEdit.excerpt)
          : undefined,
        avatar: groupToEdit.avatar?.id ?? undefined,
        startDate: groupToEdit.startDate?.toISOString(),
        endDate: groupToEdit.endDate?.toISOString(),
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
  });

  test("Should update dates", async () => {
    const result = await pipe(
      editGroupToolTask({
        id: groupToEdit.id,
        body: undefined,
        startDate: "2021-06-15",
        endDate: "2024-12-31",
        username: groupToEdit.username ?? undefined,
        members: groupToEdit.members.map((m) => m.id),
        name: groupToEdit.name,
        color: groupToEdit.color,
        kind: groupToEdit.kind,
        excerpt: isValidValue(groupToEdit.excerpt)
          ? getTextContents(groupToEdit.excerpt)
          : undefined,
        avatar: groupToEdit.avatar?.id ?? undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
  });

  test("Should handle non-existent group ID", async () => {
    const nonExistentId = fc.sample(UUIDArb, 1)[0];

    await expect(
      pipe(
        editGroupToolTask({
          id: nonExistentId,
          name: "This Should Fail",
          username: groupToEdit.username ?? undefined,
          members: groupToEdit.members.map((m) => m.id),
          color: groupToEdit.color,
          kind: groupToEdit.kind,
          excerpt: isValidValue(groupToEdit.excerpt)
            ? getTextContents(groupToEdit.excerpt)
            : undefined,
          body: isValidValue(groupToEdit.body)
            ? getTextContents(groupToEdit.body)
            : undefined,
          avatar: groupToEdit.avatar?.id ?? undefined,
          startDate: groupToEdit.startDate?.toISOString(),
          endDate: groupToEdit.endDate?.toISOString(),
        }),
        throwRTE(Test.ctx),
      ),
    ).rejects.toThrow();
  });

  test("Should reject requests without token", async () => {
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "editGroup",
        arguments: {
          id: groupToEdit.id,
          name: "Unauthorized Edit",
        },
      },
    };

    const response = await Test.req
      .post("/mcp")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);

    expect(response.status).toBe(401);
  });

  test("Should reject requests with invalid token", async () => {
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "editGroup",
        arguments: {
          id: groupToEdit.id,
          name: "Invalid Token Edit",
        },
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
