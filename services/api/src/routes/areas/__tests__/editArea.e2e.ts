import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { fc } from "@liexp/test";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Edit Area", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const area = fc.sample(AreaArb, 1)[0];
    const response = await Test.req.put(`/v1/areas/${area.id}`).send(area);

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:edit' permission", async () => {
    const area = fc.sample(AreaArb, 1)[0];
    const response = await Test.req
      .put(`/v1/areas/${uuid()}`)
      .set("Authorization", authorizationToken)
      .send({ ...area, label: "Updated Area" });

    expect(response.status).toEqual(401);
  });
});
