import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { PageArb } from "@liexp/test/lib/arbitrary/Page.arbitrary.js";
import fc from "fast-check";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("GetPage route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("get page by id returns 200", async () => {
    const user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);

    const [payload] = fc.sample(PageArb, 1);

    const createRes = await Test.req
      .post("/v1/pages")
      .set("Authorization", authorization)
      .send(payload);

    expect([200, 201]).toContain(createRes.status);
    const id = createRes.body.data.id;

    const getRes = await Test.req.get(`/v1/pages/${id}`);
    expect(getRes.status).toEqual(200);
    expect(getRes.body.data).toHaveProperty("id", id);
  });
});
