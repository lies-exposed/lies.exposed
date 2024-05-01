import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { toBNDocument } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser, saveUser } from "../../../../test/user.utils.js";
import { ActorEntity } from "#entities/Actor.entity.js";

describe("Delete Actor", () => {
  let Test: AppTest, user: any, authorizationToken: string, actor: any;
  beforeAll(async () => {
    Test = await GetAppTest();

    user = await saveUser(Test, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    const excerpt = await toBNDocument("my content");
    const body = await toBNDocument("my body");
    actor = (
      await Test.req
        .post("/v1/actors")
        .set("Authorization", authorizationToken)
        .send({
          username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
          avatar: "http://myavatar-url.com/",
          color: "ffffff",
          fullName: tests.fc.sample(tests.fc.string())[0],
          excerpt,
          body,
        })
    ).body.data;
    Test.ctx.logger.debug.log("Actor %O", actor);
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(ActorEntity, [actor.id]));

    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401", async () => {
    const response = await Test.req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  test("Should return a 200", async () => {
    const user = await saveUser(Test, ["admin:delete"]);
    const token = await loginUser(Test)(user);
    const response = await Test.req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", token.authorization);

    expect(response.status).toEqual(200);
  });
});
