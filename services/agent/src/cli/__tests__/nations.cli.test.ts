import * as NationIO from "@liexp/io/lib/http/Nation.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Nation as NationArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";
import { nationGet } from "../nations/get.js";
import { nationList } from "../nations/list.js";
import { mswServer } from "../../../test/mswServer.js";

const encodeNation = Schema.encodeSync(NationIO.Nation);

const nations = fc.sample(NationArbs.NationArb, 3).map((n, i) => ({
  ...n,
  createdAt: new Date(2024, 0, 3 - i),
}));

const encoded = nations.map(encodeNation);

const handlers = [
  http.get("http://localhost:4010/v1/nations", ({ request }) => {
    const url = new URL(request.url);
    const end = Number(url.searchParams.get("_end") ?? "20");
    const data = encoded.slice(0, end);
    return HttpResponse.json({ data, total: encoded.length });
  }),

  http.get("http://localhost:4010/v1/nations/:id", ({ params }) => {
    const nation = encoded.find((n) => n.id === params.id);
    if (!nation) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: nation });
  }),
];

describe("nation CLI", () => {
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

  test("list --end=3 returns 3 nations with expected shape", async () => {
    await nationList.run(ctx, ["--end=3"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
    });
  });

  test("list --start=0 --end=20 returns total count in response", async () => {
    await nationList.run(ctx, ["--start=0", "--end=20"]);
    const result = JSON.parse(output);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("get --id=<uuid> returns single nation matching the id", async () => {
    await nationList.run(ctx, ["--end=1"]);
    const { data } = JSON.parse(output);
    const id: string = data[0].id;

    await nationGet.run(ctx, [`--id=${id}`]);
    const result = JSON.parse(output);
    expect(result.data.id).toBe(id);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
    });
  });
});
