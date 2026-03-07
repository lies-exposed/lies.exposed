import * as GroupIO from "@liexp/io/lib/http/Group.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Group as GroupArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import type { CLIContext } from "../command.type.js";
import { groupCreate } from "../groups/create.js";
import { groupEdit } from "../groups/edit.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeGroup = Schema.encodeSync(GroupIO.Group);

const [groupA, groupB] = fc.sample(GroupArbs.GroupArb, 2).map(encodeGroup);

const server = setupServer(
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
);

describe("group create/edit CLI", () => {
  let ctx: CLIContext;
  let output: string;

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: "error" });
    ctx = await throwTE(makeCLIContext());
    vi.spyOn(console, "log").mockImplementation((v: unknown) => {
      output = String(v);
    });
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

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
});
