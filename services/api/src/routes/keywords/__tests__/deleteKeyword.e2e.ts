import {
  loginUser,
  saveUser,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import { type Keyword } from "@liexp/shared/lib/io/http/Keyword.js";
import { TagArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary.js";
import { ColorArb } from "@liexp/shared/lib/tests/arbitrary/common/Color.arbitrary.js";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("Delete Keyword", () => {
  let Test: AppTest, keyword: Keyword, user: any, authorizationToken: string;
  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    keyword = (
      await Test.req
        .post("/v1/keywords")
        .set("Authorization", authorizationToken)
        .send({
          tag: tests.fc.sample(TagArb(), 1)[0],
          color: tests.fc.sample(ColorArb, 1)[0],
        })
    ).body.data;
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401", async () => {
    user = await saveUser(Test.ctx, ["admin:read"]);
    const { authorization } = await loginUser(Test)(user);
    const response = await Test.req
      .delete(`/v1/keywords/${keyword.id}`)
      .set("Authorization", authorization);

    expect(response.status).toEqual(401);
  });

  test("Should return a 200", async () => {
    user = await saveUser(Test.ctx, ["admin:delete"]);
    const { authorization } = await loginUser(Test)(user);

    const response = await Test.req
      .delete(`/v1/keywords/${keyword.id}`)
      .set("Authorization", authorization);

    expect(response.status).toEqual(200);
  });
});
