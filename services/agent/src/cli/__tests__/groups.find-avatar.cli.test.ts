import * as MediaIO from "@liexp/io/lib/http/Media/Media.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Media as MediaArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { CLIContext } from "../command.type.js";
import { groupFindAvatar } from "../groups/find-avatar.js";
import { makeCLIContext } from "../make-cli-context.js";
import { mswServer } from "../../../test/mswServer.js";

const encodeMedia = Schema.encodeSync(MediaIO.Media);

const [mediaA] = fc.sample(MediaArbs.MediaArb, 1).map(encodeMedia);

const IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/test/Test_logo.png/400px-Test_logo.png";

const handlers = [
  // Wikipedia search
  http.get("https://en.wikipedia.org/w/rest.php/v1/search/page", () => {
    return HttpResponse.json({
      pages: [
        {
          id: 67890,
          key: "Greenpeace",
          title: "Greenpeace",
          description: "Non-governmental environmental organization",
          thumbnail: null,
        },
      ],
    });
  }),

  // Wikipedia article summary
  http.get("https://en.wikipedia.org/api/rest_v1/page/summary/:title", () => {
    return HttpResponse.json({
      title: "Greenpeace",
      originalimage: {
        source: IMAGE_URL,
        width: 400,
        height: 400,
      },
    });
  }),

  // POST /media — create after finding image
  http.post("http://localhost:4010/v1/media", () => {
    return HttpResponse.json({ data: mediaA }, { status: 201 });
  }),
];

describe("group find-avatar CLI", () => {
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

  test("find-avatar --name searches Wikipedia and creates a media entry", async () => {
    await groupFindAvatar.run(ctx, ["--name=Greenpeace"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("find-avatar without --name throws an error", async () => {
    await expect(groupFindAvatar.run(ctx, [])).rejects.toThrow(
      "--name=<string> is required",
    );
  });

  test("find-avatar with no Wikipedia results throws an error", async () => {
    mswServer.use(
      http.get("https://en.wikipedia.org/w/rest.php/v1/search/page", () => {
        return HttpResponse.json({ pages: [] });
      }),
    );
    await expect(
      groupFindAvatar.run(ctx, ["--name=Xyzzy Nonexistent Group 99999"]),
    ).rejects.toThrow(/No Wikipedia results found/);
  });
});
