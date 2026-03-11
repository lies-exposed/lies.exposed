import * as MediaIO from "@liexp/io/lib/http/Media/Media.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { Media as MediaArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mswServer } from "../../../test/mswServer.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";
import { mediaCreate } from "../media/create.js";
import { mediaEdit } from "../media/edit.js";

const encodeMedia = Schema.encodeSync(MediaIO.Media);

const [mediaA, mediaB] = fc
  .sample(MediaArbs.MediaArb, 2)
  .map((a) => encodeMedia(a));

const handlers = [
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
];

describe("media create/edit CLI", () => {
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

  test("create with optional --description returns the created media", async () => {
    await mediaCreate.run(ctx, [
      "--location=https://example.com/image3.jpg",
      "--type=image/jpg",
      "--description=A descriptive caption",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --thumbnail returns the created media", async () => {
    await mediaCreate.run(ctx, [
      "--location=https://example.com/video.mp4",
      "--type=video/mp4",
      "--thumbnail=https://example.com/thumb.jpg",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --events (multiple UUIDs) returns the created media", async () => {
    const uuids = fc.sample(UUIDArb, 2).join(",");
    await mediaCreate.run(ctx, [
      "--location=https://example.com/image4.jpg",
      "--type=image/jpg",
      `--events=${uuids}`,
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --links (multiple UUIDs) returns the created media", async () => {
    await mediaCreate.run(ctx, [
      "--location=https://example.com/image5.jpg",
      "--type=image/jpg",
      "--links=00000000-0000-4000-8000-000000000003,00000000-0000-4000-8000-000000000004",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --keywords (multiple UUIDs) returns the created media", async () => {
    await mediaCreate.run(ctx, [
      "--location=https://example.com/image6.jpg",
      "--type=image/jpg",
      "--keywords=00000000-0000-4000-8000-000000000005,00000000-0000-4000-8000-000000000006",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --areas (multiple UUIDs) returns the created media", async () => {
    await mediaCreate.run(ctx, [
      "--location=https://example.com/image7.jpg",
      "--type=image/jpg",
      "--areas=00000000-0000-4000-8000-000000000007,00000000-0000-4000-8000-000000000008",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create missing required --location throws validation error", async () => {
    await expect(mediaCreate.run(ctx, ["--type=image/jpg"])).rejects.toThrow();
  });

  test("create missing required --type throws validation error", async () => {
    await expect(
      mediaCreate.run(ctx, ["--location=https://example.com/image.jpg"]),
    ).rejects.toThrow();
  });

  // --- edit ---

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

  test("edit --id with --thumbnail returns the updated media", async () => {
    await mediaEdit.run(ctx, [
      `--id=${mediaB.id}`,
      "--location=https://example.com/video.mp4",
      "--type=video/mp4",
      "--label=Video",
      "--thumbnail=https://example.com/thumb.jpg",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --events (multiple UUIDs) returns the updated media", async () => {
    const uuids = fc.sample(UUIDArb, 2).join(",");
    await mediaEdit.run(ctx, [
      `--id=${mediaB.id}`,
      "--location=https://example.com/updated.jpg",
      "--type=image/jpg",
      "--label=Test",
      `--events=${uuids}`,
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --links (multiple UUIDs) returns the updated media", async () => {
    const uuids = fc.sample(UUIDArb, 2).join(",");
    await mediaEdit.run(ctx, [
      `--id=${mediaB.id}`,
      "--location=https://example.com/updated.jpg",
      "--type=image/jpg",
      "--label=Test",
      `--links=${uuids}`,
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --keywords (multiple UUIDs) returns the updated media", async () => {
    const uuids = fc.sample(UUIDArb, 2).join(",");
    await mediaEdit.run(ctx, [
      `--id=${mediaB.id}`,
      "--location=https://example.com/updated.jpg",
      "--type=image/jpg",
      "--label=Test",
      `--keywords=${uuids}`,
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --areas (multiple UUIDs) returns the updated media", async () => {
    const uuids = fc.sample(UUIDArb, 2).join(",");
    await mediaEdit.run(ctx, [
      `--id=${mediaB.id}`,
      "--location=https://example.com/updated.jpg",
      "--type=image/jpg",
      "--label=Test",
      `--areas=${uuids}`,
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit missing required --id throws validation error", async () => {
    await expect(
      mediaEdit.run(ctx, [
        "--location=https://example.com/updated.jpg",
        "--type=image/jpg",
        "--label=Test",
      ]),
    ).rejects.toThrow();
  });
});
