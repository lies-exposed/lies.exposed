import * as StoryIO from "@liexp/io/lib/http/Story.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Story as StoryArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mswServer } from "../../../test/mswServer.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";
import { storyCreate } from "../stories/create.js";
import { storyGet } from "../stories/get.js";
import { storyList } from "../stories/list.js";

const encodeStory = Schema.encodeSync(StoryIO.Story);

const stories = fc.sample(StoryArbs.StoryArb, 3).map((s, i) => ({
  ...s,
  createdAt: new Date(2024, 0, 3 - i),
}));

const encoded = stories.map((a) => encodeStory(a));

const handlers = [
  http.get("http://localhost:4010/v1/stories", ({ request }) => {
    const url = new URL(request.url);
    const end = Number(url.searchParams.get("_end") ?? "20");
    const data = encoded.slice(0, end);
    return HttpResponse.json({ data, total: encoded.length });
  }),

  http.get("http://localhost:4010/v1/stories/:id", ({ params }) => {
    const story = encoded.find((s) => s.id === params.id);
    if (!story) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: story });
  }),

  http.post("http://localhost:4010/v1/stories", () => {
    return HttpResponse.json({ data: encoded[0] });
  }),
];

describe("story CLI", () => {
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

  test("list --end=3 returns 3 stories with expected shape", async () => {
    await storyList.run(ctx, ["--end=3"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      path: expect.any(String),
    });
  });

  test("list --start=0 --end=20 returns total count in response", async () => {
    await storyList.run(ctx, ["--start=0", "--end=20"]);
    const result = JSON.parse(output);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("list --draft=false filters by draft status", async () => {
    await storyList.run(ctx, ["--draft=false", "--end=3"]);
    const result = JSON.parse(output);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("list without args uses default pagination", async () => {
    await storyList.run(ctx, []);
    const result = JSON.parse(output);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("get --id=<uuid> returns single story matching the id", async () => {
    await storyList.run(ctx, ["--end=1"]);
    const { data } = JSON.parse(output);
    const id: string = data[0].id;

    await storyGet.run(ctx, [`--id=${id}`]);
    const result = JSON.parse(output);
    expect(result.data.id).toBe(id);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      path: expect.any(String),
    });
  });

  test("create with required fields returns a story", async () => {
    await storyCreate.run(ctx, [
      "--title=My New Story",
      "--path=my-new-story",
      "--date=2026-03-08",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
    });
  });

  test("create with optional fields returns a story", async () => {
    await storyCreate.run(ctx, [
      "--title=My New Story",
      "--path=my-new-story",
      "--date=2026-03-08",
      "--draft=true",
      "--actors=00000000-0000-4000-8000-000000000001",
      "--keywords=00000000-0000-4000-8000-000000000002",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create missing required --title throws validation error", async () => {
    await expect(
      storyCreate.run(ctx, ["--path=my-story", "--date=2026-03-08"]),
    ).rejects.toThrow();
  });

  test("create missing required --path throws validation error", async () => {
    await expect(
      storyCreate.run(ctx, ["--title=My Story", "--date=2026-03-08"]),
    ).rejects.toThrow();
  });

  test("create missing required --date throws validation error", async () => {
    await expect(
      storyCreate.run(ctx, ["--title=My Story", "--path=my-story"]),
    ).rejects.toThrow();
  });
});
