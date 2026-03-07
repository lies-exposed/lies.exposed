import * as MediaIO from "@liexp/io/lib/http/Media/Media.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Media as MediaArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mswServer } from "../../../test/mswServer.js";
import { actorFindAvatar } from "../actors/actor-find-avatar.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeMedia = Schema.encodeSync(MediaIO.Media);

const [mediaA] = fc.sample(MediaArbs.MediaArb, 1).map(encodeMedia);

const IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/test/Test_image.jpg/800px-Test_image.jpg";

const handlers = [
  // Wikipedia search
  http.get("https://en.wikipedia.org/w/rest.php/v1/search/page", () => {
    return HttpResponse.json({
      pages: [
        {
          id: 12345,
          key: "Albert_Einstein",
          title: "Albert Einstein",
          description: "German-born theoretical physicist",
          thumbnail: null,
        },
      ],
    });
  }),

  // Wikipedia article summary
  http.get("https://en.wikipedia.org/api/rest_v1/page/summary/:title", () => {
    return HttpResponse.json({
      title: "Albert Einstein",
      originalimage: {
        source: IMAGE_URL,
        width: 800,
        height: 1000,
      },
    });
  }),

  // POST /media — create after finding image
  http.post("http://localhost:4010/v1/media", () => {
    return HttpResponse.json({ data: mediaA }, { status: 201 });
  }),
];

describe("actor find-avatar CLI", () => {
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

  test("find-avatar --fullName searches Wikipedia and creates a media entry", async () => {
    await actorFindAvatar.run(ctx, ["--fullName=Albert Einstein"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("find-avatar without --fullName throws an error", async () => {
    await expect(actorFindAvatar.run(ctx, [])).rejects.toThrow(
      "--fullName=<string> is required",
    );
  });

  test("find-avatar with no Wikipedia results throws an error", async () => {
    mswServer.use(
      http.get("https://en.wikipedia.org/w/rest.php/v1/search/page", () => {
        return HttpResponse.json({ pages: [] });
      }),
    );
    await expect(
      actorFindAvatar.run(ctx, ["--fullName=Xyzzy Nonexistent Person 99999"]),
    ).rejects.toThrow(/No Wikipedia results found/);
  });
});
