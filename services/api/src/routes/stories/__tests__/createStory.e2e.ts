import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import * as tests from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Story", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/stories").send({
      title: "Test Story",
      path: "test-story",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/stories")
      .set("Authorization", authorizationToken)
      .send({
        title: tests.fc.sample(tests.fc.string({ minLength: 5 }))[0],
        path: tests.fc.sample(tests.fc.string({ minLength: 5 }))[0],
      });

    expect(response.status).toEqual(401);
  });
});
