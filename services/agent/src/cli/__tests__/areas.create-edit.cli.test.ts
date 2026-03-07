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
import { areaCreate } from "../areas/create.js";
import { areaEdit } from "../areas/edit.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeArea = Schema.encodeSync(AreaIO.Area);

const [areaA, areaB] = fc.sample(AreaArbs.AreaArb, 2).map(encodeArea);

const server = setupServer(
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
);

describe("area create/edit CLI", () => {
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
});
