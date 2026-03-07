import * as LinkIO from "@liexp/io/lib/http/Link.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Link as LinkArbs, fc } from "@liexp/test/lib/index.js";
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
import { linkEdit } from "../links/edit.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeLink = Schema.encodeSync(LinkIO.Link);

const [_, linkB] = fc.sample(LinkArbs.LinkArb, 2).map(encodeLink);

const server = setupServer(
  // PUT /links/:id — edit
  http.put("http://localhost:4010/v1/links/:id", ({ params }) => {
    const updated =
      params.id === linkB.id ? { ...linkB, title: "Updated Title" } : linkB;
    return HttpResponse.json({ data: updated });
  }),
);

describe("link edit CLI", () => {
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

  test("edit --id --title --url returns the updated link", async () => {
    await linkEdit.run(ctx, [
      `--id=${linkB.id}`,
      "--title=Updated Title",
      "--url=https://example.com/updated",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: linkB.id,
      title: "Updated Title",
    });
  });

  test("edit --id with --status=APPROVED returns the updated link", async () => {
    await linkEdit.run(ctx, [
      `--id=${linkB.id}`,
      "--status=APPROVED",
      "--url=https://example.com/article",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("edit --id with --publishDate returns the updated link", async () => {
    await linkEdit.run(ctx, [
      `--id=${linkB.id}`,
      "--url=https://example.com/dated-article",
      "--publishDate=2024-03-15",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });
});
