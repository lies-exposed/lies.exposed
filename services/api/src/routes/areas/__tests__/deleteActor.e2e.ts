import * as tests from "@econnessione/core/tests";
import supertest from "supertest";
import { makeApp, makeContext } from "../../../server";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { RouteContext } from "@routes/route.types";
import jwt from "jsonwebtoken";

describe("Delete Actor", () => {
  let ctx: RouteContext,
    req: supertest.SuperTest<supertest.Test>,
    actor: any,
    authorizationToken: string;
  beforeAll(async () => {
    await pipe(
      makeContext(process.env),
      TE.map((context) => {
        ctx = context;
        return makeApp(ctx);
      }),
      TE.map((app) => {
        req = supertest(app);
      })
    )();

    authorizationToken = `Bearer ${jwt.sign({ id: "1" }, ctx.env.JWT_SECRET)}`;

    actor = (
      await req
        .post("/v1/actors")
        .set("Authorization", authorizationToken)
        .send({
          username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
          avatar: "http://myavatar-url.com/",
          color: "ffffff",
          fullName: "Andrea Ascari",
          body: "my content",
        })
    ).body.data;
    ctx.logger.debug.log('Actor %O', actor);
  });

  afterAll(async () => {
    await ctx.db.close()();
  });

  test("Should return a 401", async () => {
    const response = await req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
  });
});
