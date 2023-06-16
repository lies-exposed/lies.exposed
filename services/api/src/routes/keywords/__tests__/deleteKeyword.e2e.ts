import { TagArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary";
import { ColorArb } from "@liexp/shared/lib/tests/arbitrary/common/Color.arbitrary";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("Delete Keyword", () => {
  let Test: AppTest, keyword: any, user: any, authorizationToken: string;
  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test, ["admin:create"]);
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
    await throwTE(Test.ctx.db.delete(KeywordEntity, [keyword.id]));
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401", async () => {
    user = await saveUser(Test, ["admin:read"]);
    const { authorization } = await loginUser(Test)(user);
    const response = await Test.req
      .delete(`/v1/keywords/${keyword.id}`)
      .set("Authorization", authorization);

    expect(response.status).toEqual(401);
  });

  test("Should return a 200", async () => {
    user = await saveUser(Test, ["admin:delete"]);
    const { authorization } = await loginUser(Test)(user);

    const response = await Test.req
      .delete(`/v1/keywords/${keyword.id}`)
      .set("Authorization", authorization);

    expect(response.status).toEqual(200);
  });
});
