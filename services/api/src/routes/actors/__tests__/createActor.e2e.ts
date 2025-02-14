import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { pipe } from "fp-ts/lib/function.js";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Actor", () => {
  let Test: AppTest, authorizationToken: string, user;

  const [avatar] = tests.fc.sample(MediaArb, 1);

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
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
          creator: null,
          extra: null,
        },
      ]),
      throwTE,
    );
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/actors").send({
      username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
      avatar: avatar.id,
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
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string())[0],
        avatar: avatar.id,
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: "my content",
      });

    expect(response.status).toEqual(400);
  });

  test("Should create actor", async () => {
    const excerpt = toInitialValue("my excerpt");
    const body = toInitialValue("my body");
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
        avatar: avatar.id,
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: body,
        excerpt: excerpt,
      });

    expect(response.status).toEqual(201);
  });
});
