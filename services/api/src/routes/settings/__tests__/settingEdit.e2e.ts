import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Edit Setting", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.put("/v1/settings/fake-id").send({
      value: "updated value",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:edit' permission", async () => {
    const response = await Test.req
      .put("/v1/settings/fake-id")
      .set("Authorization", authorizationToken)
      .send({
        value: "updated value",
      });

    expect(response.status).toEqual(401);
  });
});
