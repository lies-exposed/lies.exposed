import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Generate TG Token", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/users/tg/token");

    expect(response.status).toEqual(401);
  });

  test("Should work for authenticated user (no specific permission required)", async () => {
    const response = await Test.req
      .post("/v1/users/tg/token")
      .set("Authorization", authorizationToken);

    // Should not return 401 since this endpoint only requires authentication, not specific permissions
    expect(response.status).not.toEqual(401);
  });
});
