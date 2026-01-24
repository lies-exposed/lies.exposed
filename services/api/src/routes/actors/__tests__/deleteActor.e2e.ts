import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toActorEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { fc } from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Delete Actor", () => {
  let Test: AppTest, user: any, authorizationToken: string;
  const [avatar] = tests.fc.sample(MediaArb, 1);
  beforeAll(async () => {
    Test = await GetAppTest();

    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    await pipe(
      Test.ctx.db.save(MediaEntity, [
        {
          ...avatar,
          links: [],
          events: [],
          keywords: [],
          areas: [],
          socialPosts: [],
          stories: [],
          featuredInAreas: [],
          featuredInStories: [],
          nationalities: [],
          creator: null,
          extra: null,
        },
      ]),
      throwTE,
    );
  });

  test("Should return a 401", async () => {
    const [actor] = fc.sample(ActorArb, 1).map(toActorEntity);
    await pipe(Test.ctx.db.save(ActorEntity, [actor]), throwTE);

    const response = await Test.req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  test("Should return a 200", async () => {
    const user = await saveUser(Test.ctx, ["admin:delete"]);
    const token = await loginUser(Test)(user);

    const [actor] = fc.sample(ActorArb, 1).map(toActorEntity);
    await pipe(Test.ctx.db.save(ActorEntity, [actor]), throwTE);

    const response = await Test.req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", token.authorization);

    expect(response.status).toEqual(200);
  });
});
