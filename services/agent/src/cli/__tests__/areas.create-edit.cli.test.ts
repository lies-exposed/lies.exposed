import * as AreaIO from "@liexp/io/lib/http/Area.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Area as AreaArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mswServer } from "../../../test/mswServer.js";
import { areaCreate } from "../areas/create.js";
import { areaEdit } from "../areas/edit.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeArea = Schema.encodeSync(AreaIO.Area);

const [areaA, areaB] = fc.sample(AreaArbs.AreaArb, 2).map(encodeArea);

const handlers = [
  // POST /areas — create
  http.post("http://localhost:4010/v1/areas", () => {
    return HttpResponse.json({ data: areaA }, { status: 201 });
  }),

  // PUT /areas/:id — edit
  http.put("http://localhost:4010/v1/areas/:id", ({ params }) => {
    const updated =
      params.id === areaB.id ? { ...areaB, label: "Updated Label" } : areaB;
    return HttpResponse.json({ data: updated });
  }),
];

describe("area create/edit CLI", () => {
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

  test("create --label --slug returns the created area", async () => {
    await areaCreate.run(ctx, ["--label=Test Area", "--slug=test-area"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("create with optional --draft=true returns the created area", async () => {
    await areaCreate.run(ctx, [
      "--label=Draft Area",
      "--slug=draft-area",
      "--draft=true",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("create with optional --geometry returns the created area", async () => {
    const geometry = JSON.stringify({
      type: "Point",
      coordinates: [30.5238, 50.4501],
    });
    await areaCreate.run(ctx, [
      "--label=Kyiv",
      "--slug=kyiv",
      `--geometry=${geometry}`,
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create missing required --label throws validation error", async () => {
    await expect(areaCreate.run(ctx, ["--slug=no-label"])).rejects.toThrow();
  });

  test("create missing required --slug throws validation error", async () => {
    await expect(areaCreate.run(ctx, ["--label=No Slug"])).rejects.toThrow();
  });

  // --- edit ---

  test("edit --id --label returns the updated area", async () => {
    await areaEdit.run(ctx, [`--id=${areaB.id}`, "--label=Updated Label"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: areaB.id,
      label: "Updated Label",
    });
  });

  test("edit --id with --slug returns the updated area", async () => {
    await areaEdit.run(ctx, [`--id=${areaB.id}`, "--slug=updated-slug"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("edit --id with --draft=false returns the updated area", async () => {
    await areaEdit.run(ctx, [`--id=${areaB.id}`, "--draft=false"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --geometry returns the updated area", async () => {
    const geometry = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          [30.0, 50.0],
          [31.0, 50.0],
          [31.0, 51.0],
          [30.0, 51.0],
          [30.0, 50.0],
        ],
      ],
    });
    await areaEdit.run(ctx, [`--id=${areaB.id}`, `--geometry=${geometry}`]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --featuredImage returns the updated area", async () => {
    await areaEdit.run(ctx, [
      `--id=${areaB.id}`,
      "--featuredImage=00000000-0000-4000-8000-000000000001",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --media (multiple UUIDs) returns the updated area", async () => {
    await areaEdit.run(ctx, [
      `--id=${areaB.id}`,
      "--media=00000000-0000-4000-8000-000000000002,00000000-0000-4000-8000-000000000003",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --events (multiple UUIDs) returns the updated area", async () => {
    await areaEdit.run(ctx, [
      `--id=${areaB.id}`,
      "--events=00000000-0000-4000-8000-000000000004,00000000-0000-4000-8000-000000000005",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit missing required --id throws validation error", async () => {
    await expect(areaEdit.run(ctx, ["--label=No ID"])).rejects.toThrow();
  });
});
