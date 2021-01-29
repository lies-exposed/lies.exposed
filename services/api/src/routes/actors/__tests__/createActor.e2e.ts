import * as tests from "@econnessione/core/lib/tests";
import supertest from "supertest";
import { makeApp, makeContext } from "../../../server";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { RouteContext } from "@routes/route.types";

describe("Create Actor", () => {
  let ctx: RouteContext, req: supertest.SuperTest<supertest.Test>;
  beforeAll(async () => {
    await pipe(
      makeContext(process.env),
      TE.map((ctx) => {
        ctx = ctx;
        return makeApp(ctx);
      }),
      TE.map((app) => {
        req = supertest(app);
      })
    )();
  });

  afterAll(async () => {
    await ctx.db.close()();
  });

  test("Should create actor", async () => {
    await req
      .post("/v1/actors")
      .send({
        username: tests.fc.sample(tests.fc.string(), 1)[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: "Andrea Ascari",
        body: "my content",
      })
      .expect(201);
  });

  test.skip("Should return a 401", async () => {
    await req
      .post("/v1/actors")
      .send({
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: "Andrea Ascari",
        body: "my content",
      })
      .expect(401);
  });

  test("Should return a 400", async () => {
    await req
      .post("/v1/actors")
      .send({
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: "Andrea Ascari",
        body: "my content",
      })
      .expect(400);
  });
});
