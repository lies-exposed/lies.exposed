import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type Actor } from "@liexp/io/lib/http/Actor.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { describe, test, expect, beforeAll } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { getUserAuthorization } from "../../../../test/utils/jwt.utils.js";

describe("List Actor", () => {
  let Test: AppTest, authorizationToken: string, actors: Actor[];
  const avatars = tests.fc.sample(MediaArb, 100);

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = getUserAuthorization(Test.ctx);

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
          avatar: a.avatar,
          nationalities: [],
        })),
      ),
    );
  });

  test("Should return actors", async () => {
    const response = await Test.req
      .get("/v1/actors")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
    expect(response.body.total).toBeGreaterThanOrEqual(100);
  });
});
