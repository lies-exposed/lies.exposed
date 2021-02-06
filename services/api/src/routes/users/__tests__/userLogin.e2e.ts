import { RouteContext } from "@routes/route.types";
import { uuid } from "@utils/uuid.utils";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import supertest from "supertest";
import { makeApp, makeContext } from "../../../server";
import { hash } from "../../../utils/password.utils";
import { UserEntity } from "../User.entity";

describe("User login", () => {
  let ctx: RouteContext,
    req: supertest.SuperTest<supertest.Test>;
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
                id: uuid(),
                username: "me@econnessione.org",
                passwordHash: password,
                email: "me@econnessione.org",
                firstName: "John",
                lastName: "Doe",
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
      username: "me@econnessione.org",
      password: "my-secure-password",
    });

    expect(response.status).toEqual(400);
  });

  test("Should return the access token", async () => {
    const response = await req.post("/v1/users/login").send({
      username: "me@econnessione.org",
      password: "my-real-secure-password",
    });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty('data.token');
  });
});
