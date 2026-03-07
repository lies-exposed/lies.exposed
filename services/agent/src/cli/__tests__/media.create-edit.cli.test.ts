import * as MediaIO from "@liexp/io/lib/http/Media/Media.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Media as MediaArbs, fc } from "@liexp/test/lib/index.js";
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
import { makeCLIContext } from "../make-cli-context.js";
import { mediaCreate } from "../media/create.js";
import { mediaEdit } from "../media/edit.js";

const encodeMedia = Schema.encodeSync(MediaIO.Media);

const [mediaA, mediaB] = fc.sample(MediaArbs.MediaArb, 2).map(encodeMedia);

const server = setupServer(
  // POST /media — create
  http.post("http://localhost:4010/v1/media", () => {
    return HttpResponse.json({ data: mediaA }, { status: 201 });
  }),

  // PUT /media/:id — edit
  http.put("http://localhost:4010/v1/media/:id", ({ params }) => {
    const updated =
      params.id === mediaB.id ? { ...mediaB, label: "Updated Label" } : mediaB;
    return HttpResponse.json({ data: updated });
  }),
);

describe("media create/edit CLI", () => {
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

  test("create --location --type returns the created media", async () => {
    await mediaCreate.run(ctx, [
      "--location=https://example.com/image.jpg",
      "--type=image/jpg",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("create with optional --label returns the created media", async () => {
    await mediaCreate.run(ctx, [
      "--location=https://example.com/image2.jpg",
      "--type=image/jpg",
      "--label=Test Image",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("edit --id --location --type --label returns the updated media", async () => {
    await mediaEdit.run(ctx, [
      `--id=${mediaB.id}`,
      "--location=https://example.com/updated.jpg",
      "--type=image/jpg",
      "--label=Updated Label",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: mediaB.id,
      label: "Updated Label",
    });
  });

  test("edit --id with --description returns the updated media", async () => {
    await mediaEdit.run(ctx, [
      `--id=${mediaB.id}`,
      "--location=https://example.com/updated.jpg",
      "--type=image/jpg",
      "--label=Test",
      "--description=A description",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });
});
