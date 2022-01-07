import * as tests from "@econnessione/core/tests";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";

describe("Delete Actor", () => {
  let Test: AppTest, actor: any, authorizationToken: string;
  beforeAll(async () => {
    Test = await initAppTest();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      Test.ctx.env.JWT_SECRET
    )}`;

    actor = (
      await Test.req
        .post("/v1/actors")
        .set("Authorization", authorizationToken)
        .send({
          username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
          avatar: "http://myavatar-url.com/",
          color: "ffffff",
          fullName: tests.fc.sample(tests.fc.string())[0],
          excerpt: { id: tests.fc.uuid(), content: { first: "my content" } },
          body: { id: tests.fc.uuid(), content: { first: "my content" } },
        })
    ).body.data;
    Test.ctx.logger.debug.log("Actor %O", actor);
  });

  afterAll(async () => {
    await Test.ctx.db.delete(ActorEntity, [actor.id])();
    await Test.ctx.db.close()();
  });

  test("Should return a 401", async () => {
    const response = await Test.req
      .delete(`/v1/actors/${actor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
  });
});
