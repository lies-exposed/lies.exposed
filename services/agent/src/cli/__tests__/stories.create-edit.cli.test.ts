import * as StoryIO from "@liexp/io/lib/http/Story.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Story as StoryArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mswServer } from "../../../test/mswServer.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";
import { storyEdit } from "../stories/edit.js";

const encodeStory = Schema.encodeSync(StoryIO.Story);

const [_storyA, storyB] = fc
  .sample(StoryArbs.StoryArb, 2)
  .map((a) => encodeStory(a));

const handlers = [
  http.put("http://localhost:4010/v1/stories/:id", ({ params }) => {
    const updated =
      params.id === storyB.id ? { ...storyB, title: "Updated Title" } : storyB;
    return HttpResponse.json({ data: updated });
  }),
];

describe("story edit CLI", () => {
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

  test("edit --id --title returns the updated story", async () => {
    await storyEdit.run(ctx, [
      `--id=${storyB.id}`,
      "--title=Updated Title",
      "--path=updated-title",
      "--date=2026-03-08",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: storyB.id,
      title: "Updated Title",
    });
  });

  test("edit --id --draft=true returns the updated story", async () => {
    await storyEdit.run(ctx, [
      `--id=${storyB.id}`,
      "--draft=true",
      "--title=Draft Story",
      "--path=draft-story",
      "--date=2026-03-08",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --actors and --groups returns the updated story", async () => {
    await storyEdit.run(ctx, [
      `--id=${storyB.id}`,
      "--title=Story with Relations",
      "--path=story-with-relations",
      "--date=2026-03-08",
      "--actors=00000000-0000-4000-8000-000000000001",
      "--groups=00000000-0000-4000-8000-000000000002",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --keywords and --links returns the updated story", async () => {
    await storyEdit.run(ctx, [
      `--id=${storyB.id}`,
      "--title=Story with Keywords",
      "--path=story-with-keywords",
      "--date=2026-03-08",
      "--keywords=00000000-0000-4000-8000-000000000003,00000000-0000-4000-8000-000000000004",
      "--links=00000000-0000-4000-8000-000000000005",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with --events and --media returns the updated story", async () => {
    await storyEdit.run(ctx, [
      `--id=${storyB.id}`,
      "--title=Story with Events",
      "--path=story-with-events",
      "--date=2026-03-08",
      "--events=00000000-0000-4000-8000-000000000006",
      "--media=00000000-0000-4000-8000-000000000007",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit missing required --id throws validation error", async () => {
    await expect(storyEdit.run(ctx, ["--title=No ID Story"])).rejects.toThrow();
  });
});
