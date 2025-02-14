import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { type Actor } from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { MediaArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { pipe } from "fp-ts/lib/function.js";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Delete Actor", () => {
  let Test: AppTest, user: any, authorizationToken: string, actor: Actor.Actor;
  const [avatar] = tests.fc.sample(MediaArb, 1);
  beforeAll(async () => {
    Test = await GetAppTest();

    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    const excerpt = toInitialValue("my content");
    const body = toInitialValue("my body");

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
          creator: null,
          extra: null,
        },
      ]),
      throwTE,
    );

    actor = (
      await Test.req
        .post("/v1/actors")
        .set("Authorization", authorizationToken)
        .send({
          username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
          avatar: avatar.id,
          color: "ffffff",
          fullName: tests.fc.sample(tests.fc.string())[0],
          excerpt,
          body,
        })
    ).body.data;
    Test.ctx.logger.debug.log("Actor %O", actor);
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401", async () => {
    const response = await Test.req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  test("Should return a 200", async () => {
    const user = await saveUser(Test.ctx, ["admin:delete"]);
    const token = await loginUser(Test)(user);
    const response = await Test.req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", token.authorization);

    expect(response.status).toEqual(200);
  });
});
