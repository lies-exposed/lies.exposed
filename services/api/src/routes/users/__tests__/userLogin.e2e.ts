import { RouteContext } from "@routes/route.types";
import { fc } from "@econnessione/core/tests";
import { uuid } from "@econnessione/shared/utils/uuid";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import supertest from "supertest";
import { makeApp, makeContext } from "../../../server";
import { hash } from "@utils/password.utils";
import { UserEntity } from "@entities/User.entity";

describe("User login", () => {
  let ctx: RouteContext,
    req: supertest.SuperTest<supertest.Test>,
    userId = uuid(),
    username = `${userId}@econnessione.org`;
  beforeAll(async () => {
    await pipe(
      makeContext(process.env),
      TE.chain((ctx) => {
        ctx = ctx;

        return pipe(
          hash("my-real-secure-password"),
          TE.chain((password) =>
            ctx.db.save(UserEntity, [
              {
                id: userId,
                username,
                passwordHash: password,
                email: username,
                firstName: fc.sample(fc.string())[0],
                lastName: fc.sample(fc.string())[0],
              },
            ])
          ),
          TE.map(() => makeApp(ctx))
        );
      }),
      TE.map((app) => {
        req = supertest(app);
      })
    )();
  });

  afterAll(async () => {
    await ctx.db.close()();
  });

  test("Should return bad request", async () => {
    const response = await req.post("/v1/users/login").send({
      username: username,
      password: "my-secure-password",
    });

    expect(response.status).toEqual(400);
  });

  test("Should return the access token", async () => {
    const response = await req.post("/v1/users/login").send({
      username: username,
      password: "my-real-secure-password",
    });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("data.token");
  });
});
