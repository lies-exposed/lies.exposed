import { http } from "@liexp/shared/io";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { throwTE } from '@liexp/shared/utils/task.utils';
import * as tests from "@liexp/test";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";

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
    await throwTE( Test.ctx.db.delete(
      ActorEntity,
      actors.map((a) => a.id)
    ));
    await throwTE( Test.ctx.db.close());
  });

  test("Should return actors", async () => {
    const response = await Test.req
      .get("/v1/actors")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
  });
});
