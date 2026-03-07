import * as ActorIO from "@liexp/io/lib/http/Actor.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Actor as ActorArbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { actorFind } from "../actors/actor-find.js";
import { actorGet } from "../actors/actor-get.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";
import { mswServer } from "../../../test/mswServer.js";

const encodeActor = Schema.encodeSync(ActorIO.Actor);

const actors = fc.sample(ActorArbs.ActorArb, 3).map((a, i) => ({
  ...a,
  createdAt: new Date(2024, 0, 3 - i),
}));

const encoded = actors.map(encodeActor);

const handlers = [
  http.get("http://localhost:4010/v1/actors", ({ request }) => {
    const url = new URL(request.url);
    const end = Number(url.searchParams.get("_end") ?? "20");
    const data = encoded.slice(0, end);
    return HttpResponse.json({ data, total: encoded.length });
  }),

  http.get("http://localhost:4010/v1/actors/:id", ({ params }) => {
    const actor = encoded.find((a) => a.id === params.id);
    if (!actor) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: actor });
  }),
];

describe("actor CLI", () => {
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

  test("list --end=3 returns 3 actors with expected shape", async () => {
    await actorFind.run(ctx, ["--end=3"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      fullName: expect.any(String),
    });
  });

  test("list --sort=createdAt --order=DESC returns latest first", async () => {
    await actorFind.run(ctx, ["--sort=createdAt", "--order=DESC", "--end=2"]);
    const { data } = JSON.parse(output);
    expect(data).toHaveLength(2);
    expect(new Date(data[0].createdAt) >= new Date(data[1].createdAt)).toBe(
      true,
    );
  });

  test("list --start=0 --end=20 returns total count in response", async () => {
    await actorFind.run(ctx, ["--start=0", "--end=20"]);
    const result = JSON.parse(output);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("get --id=<uuid> returns single actor matching the id", async () => {
    await actorFind.run(ctx, ["--end=1"]);
    const { data } = JSON.parse(output);
    const id: string = data[0].id;

    await actorGet.run(ctx, [`--id=${id}`]);
    const result = JSON.parse(output);
    expect(result.data.id).toBe(id);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      fullName: expect.any(String),
    });
  });
});
