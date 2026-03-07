import * as EventsIO from "@liexp/io/lib/http/Events/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { DeathEventArb } from "@liexp/test/lib/arbitrary/events/DeathEvent.arbitrary.js";
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
import type { CLIContext } from "../command.type.js";
import { eventCreate } from "../events/create.js";
import { eventEdit } from "../events/edit.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeEvent = Schema.encodeSync(EventsIO.Event);

const [uncatA] = fc.sample(UncategorizedArb, 1).map(encodeEvent);
const [deathA] = fc.sample(DeathEventArb, 1).map(encodeEvent);
const [uncatB] = fc.sample(UncategorizedArb, 1).map(encodeEvent);

const server = setupServer(
  // POST /events — create
  http.post("http://localhost:4010/v1/events", () => {
    return HttpResponse.json({ data: uncatA }, { status: 201 });
  }),

  // PUT /events/:id — edit
  http.put("http://localhost:4010/v1/events/:id", ({ params }) => {
    const updated = params.id === uncatB.id ? uncatB : uncatB;
    return HttpResponse.json({ data: updated });
  }),
);

describe("event create/edit CLI", () => {
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

  test("create Uncategorized --title --date returns the created event", async () => {
    await eventCreate.run(ctx, [
      "--type=Uncategorized",
      "--title=A test event",
      "--date=2024-01-15",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      type: expect.any(String),
    });
  });

  test("create Death --victim --date returns the created event", async () => {
    // MSW returns uncatA regardless; we just verify the call succeeds
    server.use(
      http.post("http://localhost:4010/v1/events", () => {
        return HttpResponse.json({ data: deathA }, { status: 201 });
      }),
    );
    await eventCreate.run(ctx, [
      "--type=Death",
      "--date=2024-03-01",
      "--victim=00000000-0000-4000-8000-000000000001",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("create Uncategorized missing --title throws validation error", async () => {
    await expect(
      eventCreate.run(ctx, [
        "--type=Uncategorized",
        "--date=2024-01-15",
        // missing --title
      ]),
    ).rejects.toThrow();
  });

  test("create Death missing --victim throws validation error", async () => {
    await expect(
      eventCreate.run(ctx, [
        "--type=Death",
        "--date=2024-01-15",
        // missing --victim
      ]),
    ).rejects.toThrow();
  });

  test("edit Uncategorized --id --title --date returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Uncategorized",
      "--title=Updated title",
      "--date=2024-02-20",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("edit Uncategorized with --draft=true returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Uncategorized",
      "--title=Draft event",
      "--draft=true",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });
});
