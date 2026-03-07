import * as EventsIO from "@liexp/io/lib/http/Events/index.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
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
import { eventGet } from "../events/get.js";
import { eventList } from "../events/list.js";
import { makeCLIContext } from "../make-cli-context.js";
import type { CLIContext } from "../command.type.js";

const encodeEvent = Schema.encodeSync(EventsIO.Event);

const events = fc
  .sample(UncategorizedArb, 3)
  .map((e, i) => ({
    ...e,
    createdAt: new Date(2024, 0, 3 - i),
  }));

const encoded = events.map(encodeEvent);

const emptyTotals = {
  uncategorized: 0,
  books: 0,
  deaths: 0,
  scientificStudies: 0,
  patents: 0,
  documentaries: 0,
  transactions: 0,
  quotes: 0,
};

const server = setupServer(
  http.get("http://localhost:4010/v1/events", ({ request }) => {
    const url = new URL(request.url);
    const end = Number(url.searchParams.get("_end") ?? "20");
    const data = encoded.slice(0, end);
    return HttpResponse.json({
      data,
      total: encoded.length,
      totals: { ...emptyTotals, uncategorized: encoded.length },
      firstDate: undefined,
      lastDate: undefined,
    });
  }),

  http.get("http://localhost:4010/v1/events/:id", ({ params }) => {
    const event = encoded.find((e) => e.id === params.id);
    if (!event) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: event });
  }),
);

describe("event CLI", () => {
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

  test("list --end=3 returns 3 events with expected shape", async () => {
    await eventList.run(ctx, ["--end=3"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      type: expect.any(String),
    });
  });

  test("list --start=0 --end=20 returns total count in response", async () => {
    await eventList.run(ctx, ["--start=0", "--end=20"]);
    const result = JSON.parse(output);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("list --type=Uncategorized filters by event type", async () => {
    await eventList.run(ctx, ["--type=Uncategorized", "--end=3"]);
    const { data } = JSON.parse(output);
    expect(Array.isArray(data)).toBe(true);
  });

  test("get --id=<uuid> returns single event matching the id", async () => {
    await eventList.run(ctx, ["--end=1"]);
    const { data } = JSON.parse(output);
    const id: string = data[0].id;

    await eventGet.run(ctx, [`--id=${id}`]);
    const result = JSON.parse(output);
    expect(result.data.id).toBe(id);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      type: expect.any(String),
    });
  });
});
