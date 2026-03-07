import * as GroupIO from "@liexp/io/lib/http/Group.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Group as GroupArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { CLIContext } from "../command.type.js";
import { groupCreate } from "../groups/create.js";
import { groupEdit } from "../groups/edit.js";
import { makeCLIContext } from "../make-cli-context.js";
import { mswServer } from "../../../test/mswServer.js";

const encodeGroup = Schema.encodeSync(GroupIO.Group);

const [groupA, groupB] = fc.sample(GroupArbs.GroupArb, 2).map(encodeGroup);

const handlers = [
  // POST /groups — create
  http.post("http://localhost:4010/v1/groups", () => {
    return HttpResponse.json({ data: groupA }, { status: 201 });
  }),

  // PUT /groups/:id — edit
  http.put("http://localhost:4010/v1/groups/:id", ({ params }) => {
    const updated =
      params.id === groupB.id ? { ...groupB, name: "Updated Group" } : groupB;
    return HttpResponse.json({ data: updated });
  }),
];

describe("group create/edit CLI", () => {
  let ctx: CLIContext;
  let output: string;

  beforeAll(async () => {
    ctx = await throwTE(makeCLIContext());
    vi.spyOn(console, "log").mockImplementation((v: unknown) => {
      output = String(v);
    });
  });

  beforeEach(() => {
    mswServer.use(...handlers);
  });

  // --- create ---

  test("create --name --username --kind=Public returns the created group", async () => {
    await groupCreate.run(ctx, [
      "--name=Test Group",
      "--username=test-group",
      "--kind=Public",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
    });
  });

  test("create with optional --color returns the created group", async () => {
    await groupCreate.run(ctx, [
      "--name=Test Group 2",
      "--username=test-group-2",
      "--kind=Private",
      "--color=0000ff",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("create with optional --excerpt returns the created group", async () => {
    await groupCreate.run(ctx, [
      "--name=Test Group 3",
      "--username=test-group-3",
      "--kind=Public",
      "--excerpt=A short group description",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --avatar returns the created group", async () => {
    await groupCreate.run(ctx, [
      "--name=Test Group 4",
      "--username=test-group-4",
      "--kind=Public",
      "--avatar=00000000-0000-4000-8000-000000000001",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --startDate and --endDate returns the created group", async () => {
    await groupCreate.run(ctx, [
      "--name=Test Group 5",
      "--username=test-group-5",
      "--kind=Public",
      "--startDate=2000-01-01",
      "--endDate=2020-12-31",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create missing required --name throws validation error", async () => {
    await expect(
      groupCreate.run(ctx, ["--username=no-name", "--kind=Public"]),
    ).rejects.toThrow();
  });

  test("create missing required --kind throws validation error", async () => {
    await expect(
      groupCreate.run(ctx, ["--name=No Kind", "--username=no-kind"]),
    ).rejects.toThrow();
  });

  // --- edit ---

  test("edit --id --name returns the updated group", async () => {
    await groupEdit.run(ctx, [`--id=${groupB.id}`, "--name=Updated Group"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: groupB.id,
      name: "Updated Group",
    });
  });

  test("edit --id with optional --kind returns the updated group", async () => {
    await groupEdit.run(ctx, [`--id=${groupB.id}`, "--kind=Private"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("edit --id with optional --excerpt returns the updated group", async () => {
    await groupEdit.run(ctx, [
      `--id=${groupB.id}`,
      "--excerpt=Updated description",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --avatar returns the updated group", async () => {
    await groupEdit.run(ctx, [
      `--id=${groupB.id}`,
      "--avatar=00000000-0000-4000-8000-000000000002",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --startDate and --endDate returns the updated group", async () => {
    await groupEdit.run(ctx, [
      `--id=${groupB.id}`,
      "--startDate=2005-06-01",
      "--endDate=2022-03-15",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --members (multiple UUIDs) returns the updated group", async () => {
    await groupEdit.run(ctx, [
      `--id=${groupB.id}`,
      "--members=00000000-0000-4000-8000-000000000003,00000000-0000-4000-8000-000000000004",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --color returns the updated group", async () => {
    await groupEdit.run(ctx, [`--id=${groupB.id}`, "--color=ff0000"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit missing required --id throws validation error", async () => {
    await expect(groupEdit.run(ctx, ["--name=No ID"])).rejects.toThrow();
  });
});
