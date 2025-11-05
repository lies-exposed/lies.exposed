import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as tests from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Extract Scientific Study From URL", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req
      .put(`/v1/scientific-studies/${uuid()}/extract`)
      .send({
        url: "https://example.com/study",
      });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .put(`/v1/scientific-studies/${uuid()}/extract`)
      .set("Authorization", authorizationToken)
      .send({
        url: tests.fc.sample(tests.fc.webUrl())[0],
      });

    expect(response.status).toEqual(401);
  });
});
