import { type http } from "@liexp/shared/lib/io/index.js";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "#entities/Actor.entity.js";

describe("List Actor", () => {
  let Test: AppTest, authorizationToken: string, actors: http.Actor.Actor[];

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    actors = tests.fc.sample(ActorArb, 100);

    await throwTE(
      Test.ctx.db.save(
        ActorEntity,
        actors.map((a) => ({
          ...a,
          memberIn: [],
          bornOn: undefined,
          diedOn: undefined,
          death: undefined,
        })),
      ),
    );
  });

  afterAll(async () => {
    await throwTE(
      Test.ctx.db.delete(
        ActorEntity,
        actors.map((a) => a.id),
      ),
    );

    await Test.utils.e2eAfterAll();
  });

  test("Should return actors", async () => {
    const response = await Test.req
      .get("/v1/actors")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
    expect(response.body.total).toBe(100);
  });
});
