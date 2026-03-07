import * as EventsIO from "@liexp/io/lib/http/Events/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { BookEventArb } from "@liexp/test/lib/arbitrary/events/BookEvent.arbitrary.js";
import { DeathEventArb } from "@liexp/test/lib/arbitrary/events/DeathEvent.arbitrary.js";
import { DocumentaryEventArb } from "@liexp/test/lib/arbitrary/events/DocumentaryEvent.arbitrary.js";
import { PatentEventArb } from "@liexp/test/lib/arbitrary/events/PatentEvent.arbitrary.js";
import { QuoteEventArb } from "@liexp/test/lib/arbitrary/events/QuoteEvent.arbitrary.js";
import { ScientificStudyEventArb } from "@liexp/test/lib/arbitrary/events/ScientificStudyEvent.arbitrary.js";
import { TransactionEventArb } from "@liexp/test/lib/arbitrary/events/TransactionEvent.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { CLIContext } from "../command.type.js";
import { eventCreate } from "../events/create.js";
import { eventEdit } from "../events/edit.js";
import { makeCLIContext } from "../make-cli-context.js";
import { mswServer } from "../../../test/mswServer.js";

const encodeEvent = Schema.encodeSync(EventsIO.Event);

const [uncatA] = fc.sample(UncategorizedArb, 1).map(encodeEvent);
const [deathA] = fc.sample(DeathEventArb, 1).map(encodeEvent);
const [quoteA] = fc.sample(QuoteEventArb, 1).map(encodeEvent);
const [transactionA] = fc.sample(TransactionEventArb, 1).map(encodeEvent);
const [studyA] = fc.sample(ScientificStudyEventArb, 1).map(encodeEvent);
const [bookA] = fc.sample(BookEventArb, 1).map(encodeEvent);
const [patentA] = fc.sample(PatentEventArb, 1).map(encodeEvent);
const [docA] = fc.sample(DocumentaryEventArb, 1).map(encodeEvent);
const [uncatB] = fc.sample(UncategorizedArb, 1).map(encodeEvent);

const handlers = [
  // POST /events — create (default: Uncategorized)
  http.post("http://localhost:4010/v1/events", () => {
    return HttpResponse.json({ data: uncatA }, { status: 201 });
  }),

  // PUT /events/:id — edit
  http.put("http://localhost:4010/v1/events/:id", () => {
    return HttpResponse.json({ data: uncatB });
  }),
];

describe("event create/edit CLI", () => {
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

  // ── create: Uncategorized ──────────────────────────────────────────────

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

  test("create Uncategorized with optional --excerpt --links --keywords returns the created event", async () => {
    await eventCreate.run(ctx, [
      "--type=Uncategorized",
      "--title=Event with relations",
      "--date=2024-01-16",
      "--excerpt=Short summary",
      "--links=00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002",
      "--keywords=00000000-0000-4000-8000-000000000003",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create Uncategorized with optional --actors --groups --endDate returns the created event", async () => {
    await eventCreate.run(ctx, [
      "--type=Uncategorized",
      "--title=Event with actors",
      "--date=2024-01-17",
      "--actors=00000000-0000-4000-8000-000000000004",
      "--groups=00000000-0000-4000-8000-000000000005",
      "--endDate=2024-01-20",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
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

  // ── create: Death ──────────────────────────────────────────────────────

  test("create Death --victim --date returns the created event", async () => {
    mswServer.use(
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
    expect(result.data).toMatchObject({ id: expect.any(String) });
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

  // ── create: Quote ──────────────────────────────────────────────────────

  test("create Quote --date with optional --actor --quote returns the created event", async () => {
    mswServer.use(
      http.post("http://localhost:4010/v1/events", () => {
        return HttpResponse.json({ data: quoteA }, { status: 201 });
      }),
    );
    await eventCreate.run(ctx, [
      "--type=Quote",
      "--date=2024-04-01",
      "--actor=00000000-0000-4000-8000-000000000002",
      "--quote=This is a quote",
      "--details=Additional context",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── create: Transaction ────────────────────────────────────────────────

  test("create Transaction with all required fields returns the created event", async () => {
    mswServer.use(
      http.post("http://localhost:4010/v1/events", () => {
        return HttpResponse.json({ data: transactionA }, { status: 201 });
      }),
    );
    await eventCreate.run(ctx, [
      "--type=Transaction",
      "--date=2024-05-01",
      "--title=Transfer",
      "--total=1000000",
      "--currency=USD",
      "--fromType=actor",
      "--fromId=00000000-0000-4000-8000-000000000003",
      "--toType=group",
      "--toId=00000000-0000-4000-8000-000000000004",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create Transaction missing required fields throws validation error", async () => {
    await expect(
      eventCreate.run(ctx, [
        "--type=Transaction",
        "--date=2024-05-01",
        "--title=Transfer",
        // missing --total, --currency, --fromType, etc.
      ]),
    ).rejects.toThrow();
  });

  // ── create: ScientificStudy ────────────────────────────────────────────

  test("create ScientificStudy --title --studyUrl returns the created event", async () => {
    mswServer.use(
      http.post("http://localhost:4010/v1/events", () => {
        return HttpResponse.json({ data: studyA }, { status: 201 });
      }),
    );
    await eventCreate.run(ctx, [
      "--type=ScientificStudy",
      "--date=2024-06-01",
      "--title=A Research Paper",
      "--studyUrl=00000000-0000-4000-8000-000000000005",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create ScientificStudy missing --title or --studyUrl throws validation error", async () => {
    await expect(
      eventCreate.run(ctx, [
        "--type=ScientificStudy",
        "--date=2024-06-01",
        "--title=A Research Paper",
        // missing --studyUrl
      ]),
    ).rejects.toThrow();
  });

  // ── create: Book ───────────────────────────────────────────────────────

  test("create Book --title --pdf returns the created event", async () => {
    mswServer.use(
      http.post("http://localhost:4010/v1/events", () => {
        return HttpResponse.json({ data: bookA }, { status: 201 });
      }),
    );
    await eventCreate.run(ctx, [
      "--type=Book",
      "--date=2024-07-01",
      "--title=A Good Book",
      "--pdf=00000000-0000-4000-8000-000000000006",
      "--authors=00000000-0000-4000-8000-000000000007",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create Book missing --title or --pdf throws validation error", async () => {
    await expect(
      eventCreate.run(ctx, [
        "--type=Book",
        "--date=2024-07-01",
        "--title=A Good Book",
        // missing --pdf
      ]),
    ).rejects.toThrow();
  });

  // ── create: Patent ─────────────────────────────────────────────────────

  test("create Patent --title returns the created event", async () => {
    mswServer.use(
      http.post("http://localhost:4010/v1/events", () => {
        return HttpResponse.json({ data: patentA }, { status: 201 });
      }),
    );
    await eventCreate.run(ctx, [
      "--type=Patent",
      "--date=2024-08-01",
      "--title=Invention XYZ",
      "--ownerActors=00000000-0000-4000-8000-000000000008",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create Patent missing --title throws validation error", async () => {
    await expect(
      eventCreate.run(ctx, [
        "--type=Patent",
        "--date=2024-08-01",
        // missing --title
      ]),
    ).rejects.toThrow();
  });

  // ── create: Documentary ────────────────────────────────────────────────

  test("create Documentary --title --documentaryMedia returns the created event", async () => {
    mswServer.use(
      http.post("http://localhost:4010/v1/events", () => {
        return HttpResponse.json({ data: docA }, { status: 201 });
      }),
    );
    await eventCreate.run(ctx, [
      "--type=Documentary",
      "--date=2024-09-01",
      "--title=A Documentary Film",
      "--documentaryMedia=00000000-0000-4000-8000-000000000009",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create Documentary missing --title or --documentaryMedia throws validation error", async () => {
    await expect(
      eventCreate.run(ctx, [
        "--type=Documentary",
        "--date=2024-09-01",
        "--title=A Documentary Film",
        // missing --documentaryMedia
      ]),
    ).rejects.toThrow();
  });

  // ── edit: Uncategorized ────────────────────────────────────────────────

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

  test("edit Uncategorized with --excerpt --links --media returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Uncategorized",
      "--title=Updated",
      "--excerpt=Updated excerpt",
      "--links=00000000-0000-4000-8000-000000000001",
      "--media=00000000-0000-4000-8000-000000000002",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── edit: Death ────────────────────────────────────────────────────────

  test("edit Death --id --victim returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Death",
      "--victim=00000000-0000-4000-8000-000000000001",
      "--date=2024-03-15",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── edit: Quote ────────────────────────────────────────────────────────

  test("edit Quote --id --actor --quote returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Quote",
      "--date=2024-04-10",
      "--actor=00000000-0000-4000-8000-000000000002",
      "--quote=An updated quote",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── edit: Transaction ──────────────────────────────────────────────────

  test("edit Transaction with all required payload fields returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Transaction",
      "--date=2024-05-20",
      "--title=Updated Transfer",
      "--total=2000000",
      "--currency=EUR",
      "--fromType=group",
      "--fromId=00000000-0000-4000-8000-000000000003",
      "--toType=actor",
      "--toId=00000000-0000-4000-8000-000000000004",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── edit: ScientificStudy ──────────────────────────────────────────────

  test("edit ScientificStudy --id --title --studyUrl returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=ScientificStudy",
      "--date=2024-06-15",
      "--title=Updated Study",
      "--studyUrl=00000000-0000-4000-8000-000000000005",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── edit: Book ─────────────────────────────────────────────────────────

  test("edit Book --id --title --pdf returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Book",
      "--date=2024-07-10",
      "--title=Updated Book",
      "--pdf=00000000-0000-4000-8000-000000000006",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── edit: Patent ───────────────────────────────────────────────────────

  test("edit Patent --id --title returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Patent",
      "--date=2024-08-05",
      "--title=Updated Patent",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  // ── edit: Documentary ──────────────────────────────────────────────────

  test("edit Documentary --id --title --documentaryMedia returns the updated event", async () => {
    await eventEdit.run(ctx, [
      `--id=${uncatB.id}`,
      "--type=Documentary",
      "--date=2024-09-12",
      "--title=Updated Documentary",
      "--documentaryMedia=00000000-0000-4000-8000-000000000009",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });
});
