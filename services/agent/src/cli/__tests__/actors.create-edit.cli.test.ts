import * as ActorIO from "@liexp/io/lib/http/Actor.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Actor as ActorArbs, fc } from "@liexp/test/lib/index.js";
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
import { actorCreate } from "../actors/actor-create.js";
import { actorEdit } from "../actors/actor-edit.js";
import type { CLIContext } from "../command.type.js";
import { makeCLIContext } from "../make-cli-context.js";

const encodeActor = Schema.encodeSync(ActorIO.Actor);

const [actorA, actorB] = fc.sample(ActorArbs.ActorArb, 2).map(encodeActor);

const server = setupServer(
  // POST /actors — create
  http.post("http://localhost:4010/v1/actors", () => {
    return HttpResponse.json({ data: actorA }, { status: 201 });
  }),

  // PUT /actors/:id — edit
  http.put("http://localhost:4010/v1/actors/:id", ({ params }) => {
    const updated =
      params.id === actorB.id
        ? { ...actorB, fullName: "Updated Name" }
        : actorB;
    return HttpResponse.json({ data: updated });
  }),
);

describe("actor create/edit CLI", () => {
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

  test("create --username --fullName returns the created actor", async () => {
    await actorCreate.run(ctx, [
      "--username=test-actor",
      "--fullName=Test Actor",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
      fullName: expect.any(String),
    });
  });

  test("create with optional --color returns the created actor", async () => {
    await actorCreate.run(ctx, [
      "--username=test-actor2",
      "--fullName=Test Actor 2",
      "--color=ff0000",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });

  test("edit --id --fullName returns the updated actor", async () => {
    await actorEdit.run(ctx, [`--id=${actorB.id}`, "--fullName=Updated Name"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: actorB.id,
      fullName: "Updated Name",
    });
  });

  test("edit --id with optional --color returns the updated actor", async () => {
    await actorEdit.run(ctx, [`--id=${actorB.id}`, "--color=00ff00"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({
      id: expect.any(String),
    });
  });
});
