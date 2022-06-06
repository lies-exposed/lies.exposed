import * as tests from "@liexp/core/tests";
import { TagArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import { ColorArb } from "@liexp/shared/tests/arbitrary/common/Color.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("Delete Keyword", () => {
  let Test: AppTest, keyword: any, authorizationToken: string;
  beforeAll(async () => {
    Test = await initAppTest();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      Test.ctx.env.JWT_SECRET
    )}`;

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
    await throwTE(Test.ctx.db.close());
  });

  test("Should return a 401", async () => {
    const response = await Test.req
      .delete(`/v1/keywords/${keyword.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
  });
});
