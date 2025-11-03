import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Build Image", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/admins/images/build").send({
      eventId: "fake-event-id",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/admins/images/build")
      .set("Authorization", authorizationToken)
      .send({
        eventId: "fake-event-id",
      });

    expect(response.status).toEqual(401);
  });
});
