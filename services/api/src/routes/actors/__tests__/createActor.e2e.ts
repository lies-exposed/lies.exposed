import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser, saveUser } from "../../../../test/user.utils.js";
import { ActorEntity } from "#entities/Actor.entity.js";

describe("Create Actor", () => {
  let Test: AppTest, authorizationToken: string, user, actor: any;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(ActorEntity, actor.id));
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/actors").send({
      username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
      avatar: "http://myavatar-url.com/",
      color: "ffffff",
      fullName: tests.fc.sample(tests.fc.string())[0],
      body: "my content",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string())[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: "my content",
      });

    expect(response.status).toEqual(401);
  });

  test("Should return a 400 when 'username' is not provided", async () => {
    user = await saveUser(Test, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string())[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: "my content",
      });

    expect(response.status).toEqual(400);
  });

  test("Should create actor", async () => {
    const excerpt = [{ type: "paragraph", content: "my excerpt" }];
    const body = [{ type: "paragraph", content: "my body" }];
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: body,
        excerpt: excerpt,
      });

    expect(response.status).toEqual(201);

    actor = response.body.data;
  });
});
