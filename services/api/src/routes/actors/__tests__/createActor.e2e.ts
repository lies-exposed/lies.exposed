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

  test.skip("Should return a 401", async () => {
    const response = await req.post("/v1/actors").send({
      username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
      avatar: "http://myavatar-url.com/",
      color: "ffffff",
      fullName: "Andrea Ascari",
      body: "my content",
    });

    expect(response.status).toEqual(401);
  });

  test.skip("Should return a 400", async () => {
    const response = await req
      .post("/v1/actors")
      // .set("Authorization", "code")
      .send({
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: "Andrea Ascari",
        body: "my content",
      });

    console.log(response.body)

    expect(response.status).toEqual(400);
  });

  test("Should create actor", async () => {
    const response = await req
      .post("/v1/actors")
      .set("Authorization", "code")
      .send({
        username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: "Andrea Ascari",
        body: "my content",
      });

    expect(response.status).toEqual(201);
  });

});
