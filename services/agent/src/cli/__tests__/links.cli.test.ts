import * as LinkIO from "@liexp/io/lib/http/Link.js";
import { Link as LinkArbs, fc } from "@liexp/test/lib/index.js";
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
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { linkCreate } from "../links/create.js";
import { linkGet } from "../links/get.js";
import { linkList } from "../links/list.js";
import { makeCLIContext } from "../make-cli-context.js";
import type { CLIContext } from "../command.type.js";

const encodeLink = Schema.encodeSync(LinkIO.Link);

const links = fc.sample(LinkArbs.LinkArb, 3).map((l, i) => ({
  ...l,
  createdAt: new Date(2024, 0, 3 - i),
}));

const encoded = links.map(encodeLink);

const server = setupServer(
  http.get("http://localhost:4010/v1/links", ({ request }) => {
    const url = new URL(request.url);
    const end = Number(url.searchParams.get("_end") ?? "20");
    const data = encoded.slice(0, end);
    return HttpResponse.json({ data, total: encoded.length });
  }),

  http.get("http://localhost:4010/v1/links/:id", ({ params }) => {
    const link = encoded.find((l) => l.id === params.id);
    if (!link) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: link });
  }),

  http.post("http://localhost:4010/v1/links/submit", () => {
    return HttpResponse.json({ data: encoded[0] });
  }),
);

describe("link CLI", () => {
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

  test("list --end=3 returns 3 links with expected shape", async () => {
    await linkList.run(ctx, ["--end=3"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      url: expect.any(String),
    });
  });

  test("list --sort=createdAt --order=DESC returns items", async () => {
    await linkList.run(ctx, ["--sort=createdAt", "--order=DESC", "--end=2"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(2);
  });

  test("list --start=0 --end=20 returns total count in response", async () => {
    await linkList.run(ctx, ["--start=0", "--end=20"]);
    const result = JSON.parse(output);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("get --id=<uuid> returns single link matching the id", async () => {
    await linkList.run(ctx, ["--end=1"]);
    const { data } = JSON.parse(output);
    const id: string = data[0].id;

    await linkGet.run(ctx, [`--id=${id}`]);
    const result = JSON.parse(output);
    expect(result.data.id).toBe(id);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      url: expect.any(String),
    });
  });

  test("create --url=<url> submits the URL and returns a link", async () => {
    await linkCreate.run(ctx, ["--url=https://example.com/article"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      url: expect.any(String),
    });
  });
});
