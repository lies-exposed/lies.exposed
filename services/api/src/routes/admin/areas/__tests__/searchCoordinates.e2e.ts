import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Search Coordinates", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req
      .post(`/v1/admins/areas/${uuid()}/search-coordinates`)
      .send({
        label: "New York",
      });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:read' permission", async () => {
    const response = await Test.req
      .post(`/v1/admins/areas/${uuid()}/search-coordinates`)
      .set("Authorization", authorizationToken)
      .send({
        label: "New York",
      });

    expect(response.status).toEqual(401);
  });
});
