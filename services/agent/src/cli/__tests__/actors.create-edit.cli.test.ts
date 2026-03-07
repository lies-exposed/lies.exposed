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

  // --- create ---

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

  test("create with optional --avatar returns the created actor", async () => {
    await actorCreate.run(ctx, [
      "--username=test-actor3",
      "--fullName=Test Actor 3",
      "--avatar=00000000-0000-4000-8000-000000000001",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --excerpt returns the created actor", async () => {
    await actorCreate.run(ctx, [
      "--username=test-actor4",
      "--fullName=Test Actor 4",
      "--excerpt=A short bio",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --bornOn and --diedOn returns the created actor", async () => {
    await actorCreate.run(ctx, [
      "--username=test-actor5",
      "--fullName=Test Actor 5",
      "--bornOn=1950-01-01",
      "--diedOn=2020-06-15",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --nationalityIds returns the created actor", async () => {
    await actorCreate.run(ctx, [
      "--username=test-actor6",
      "--fullName=Test Actor 6",
      "--nationalityIds=00000000-0000-4000-8000-000000000002,00000000-0000-4000-8000-000000000003",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create with optional --body returns the created actor", async () => {
    await actorCreate.run(ctx, [
      "--username=test-actor7",
      "--fullName=Test Actor 7",
      "--body=Full biography text here",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("create missing required --username throws validation error", async () => {
    await expect(
      actorCreate.run(ctx, ["--fullName=No Username"]),
    ).rejects.toThrow();
  });

  test("create missing required --fullName throws validation error", async () => {
    await expect(
      actorCreate.run(ctx, ["--username=no-fullname"]),
    ).rejects.toThrow();
  });

  // --- edit ---

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

  test("edit --id with optional --username returns the updated actor", async () => {
    await actorEdit.run(ctx, [`--id=${actorB.id}`, "--username=new-username"]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --excerpt returns the updated actor", async () => {
    await actorEdit.run(ctx, [
      `--id=${actorB.id}`,
      "--excerpt=Updated biography",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --body returns the updated actor", async () => {
    await actorEdit.run(ctx, [
      `--id=${actorB.id}`,
      "--body=Full updated biography body",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --avatar returns the updated actor", async () => {
    await actorEdit.run(ctx, [
      `--id=${actorB.id}`,
      "--avatar=00000000-0000-4000-8000-000000000004",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --bornOn and --diedOn returns the updated actor", async () => {
    await actorEdit.run(ctx, [
      `--id=${actorB.id}`,
      "--bornOn=1960-03-10",
      "--diedOn=2021-11-20",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --memberIn (multiple UUIDs) returns the updated actor", async () => {
    await actorEdit.run(ctx, [
      `--id=${actorB.id}`,
      "--memberIn=00000000-0000-4000-8000-000000000005,00000000-0000-4000-8000-000000000006",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit --id with optional --nationalities (multiple UUIDs) returns the updated actor", async () => {
    await actorEdit.run(ctx, [
      `--id=${actorB.id}`,
      "--nationalities=00000000-0000-4000-8000-000000000007,00000000-0000-4000-8000-000000000008",
    ]);
    const result = JSON.parse(output);
    expect(result.data).toMatchObject({ id: expect.any(String) });
  });

  test("edit missing required --id throws validation error", async () => {
    await expect(actorEdit.run(ctx, ["--fullName=No ID"])).rejects.toThrow();
  });
});
