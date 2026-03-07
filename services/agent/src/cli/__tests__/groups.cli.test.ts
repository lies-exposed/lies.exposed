import * as GroupIO from "@liexp/io/lib/http/Group.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Group as GroupArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mswServer } from "../../../test/mswServer.js";
import type { CLIContext } from "../command.type.js";
import { groupGet } from "../groups/get.js";
import { groupList } from "../groups/list.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeGroup = Schema.encodeSync(GroupIO.Group);

const groups = fc.sample(GroupArbs.GroupArb, 3).map((g, i) => ({
  ...g,
  createdAt: new Date(2024, 0, 3 - i),
}));

const encoded = groups.map(encodeGroup);

const handlers = [
  http.get("http://localhost:4010/v1/groups", ({ request }) => {
    const url = new URL(request.url);
    const end = Number(url.searchParams.get("_end") ?? "20");
    const data = encoded.slice(0, end);
    return HttpResponse.json({ data, total: encoded.length });
  }),

  http.get("http://localhost:4010/v1/groups/:id", ({ params }) => {
    const group = encoded.find((g) => g.id === params.id);
    if (!group) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: group });
  }),
];

describe("group CLI", () => {
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

  test("list --end=3 returns 3 groups with expected shape", async () => {
    await groupList.run(ctx, ["--end=3"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
    });
  });

  test("list --sort=createdAt --order=DESC returns latest first", async () => {
    await groupList.run(ctx, ["--sort=createdAt", "--order=DESC", "--end=2"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(2);
    expect(new Date(data[0].createdAt) >= new Date(data[1].createdAt)).toBe(
      true,
    );
  });

  test("list --start=0 --end=20 returns total count in response", async () => {
    await groupList.run(ctx, ["--start=0", "--end=20"]);
    const result = JSON.parse(output);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("get --id=<uuid> returns single group matching the id", async () => {
    await groupList.run(ctx, ["--end=1"]);
    const { data } = JSON.parse(output);
    const id: string = data[0].id;

    await groupGet.run(ctx, [`--id=${id}`]);
    const result = JSON.parse(output);
    expect(result.data.id).toBe(id);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
    });
  });
});
