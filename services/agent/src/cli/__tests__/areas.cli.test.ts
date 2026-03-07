import * as AreaIO from "@liexp/io/lib/http/Area.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Area as AreaArbs, fc } from "@liexp/test/lib/index.js";
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
import { areaGet } from "../areas/get.js";
import { areaList } from "../areas/list.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeArea = Schema.encodeSync(AreaIO.Area);

const areas = fc.sample(AreaArbs.AreaArb, 3).map((a, i) => ({
  ...a,
  createdAt: new Date(2024, 0, 3 - i),
}));

const encoded = areas.map(encodeArea);

const server = setupServer(
  http.get("http://localhost:4010/v1/areas", ({ request }) => {
    const url = new URL(request.url);
    const end = Number(url.searchParams.get("_end") ?? "20");
    const data = encoded.slice(0, end);
    return HttpResponse.json({ data, total: encoded.length });
  }),

  http.get("http://localhost:4010/v1/areas/:id", ({ params }) => {
    const area = encoded.find((a) => a.id === params.id);
    if (!area) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: area });
  }),
);

describe("area CLI", () => {
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

  test("list --end=3 returns 3 areas with expected shape", async () => {
    await areaList.run(ctx, ["--end=3"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      label: expect.any(String),
    });
  });

  test("list --start=0 --end=20 returns total count in response", async () => {
    await areaList.run(ctx, ["--start=0", "--end=20"]);
    const result = JSON.parse(output);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("get --id=<uuid> returns single area matching the id", async () => {
    await areaList.run(ctx, ["--end=1"]);
    const { data } = JSON.parse(output);
    const id: string = data[0].id;

    await areaGet.run(ctx, [`--id=${id}`]);
    const result = JSON.parse(output);
    expect(result.data.id).toBe(id);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      label: expect.any(String),
    });
  });
});
