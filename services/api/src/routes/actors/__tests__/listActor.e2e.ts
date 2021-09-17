import * as tests from "@econnessione/core/tests";
import { http } from "@econnessione/shared/io";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { ActorEntity } from "@entities/Actor.entity";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("List Actor", () => {
  let Test: AppTest, authorizationToken: string, actors: http.Actor.Actor[];
  beforeAll(async () => {
    Test = await initAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    actors = tests.fc.sample(ActorArb, 100);

    await Test.ctx.db.save(
      ActorEntity,
      actors.map((a) => ({
        ...a,
        memberIn: [],
        death: undefined,
      }))
    )();
  });

  afterAll(async () => {
    await Test.ctx.db.delete(
      ActorEntity,
      actors.map((a) => a.id)
    )();
    await Test.ctx.db.close()();
  });

  test("Should return actors", async () => {
    const response = await Test.req
      .get("/v1/actors")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
  });
});
