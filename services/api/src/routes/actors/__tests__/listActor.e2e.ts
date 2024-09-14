import {
  ActorArb,
  type ActorArbType,
} from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { MediaArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";

describe("List Actor", () => {
  let Test: AppTest, authorizationToken: string, actors: ActorArbType[];
  const avatars = tests.fc.sample(MediaArb, 100);

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    actors = avatars.flatMap((avatar) =>
      tests.fc.sample(ActorArb, 1).map((a) => ({ ...a, avatar })),
    );

    await throwTE(
      Test.ctx.db.save(
        ActorEntity,
        actors.map((a) => ({
          ...a,
          memberIn: [],
          bornOn: undefined,
          diedOn: undefined,
          death: undefined,
          avatar: a.avatar as any,
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

    await throwTE(
      Test.ctx.db.delete(
        MediaEntity,
        avatars.map((a) => a.id),
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
