import * as tests from "@econnessione/core/tests";
import { TagArb } from "@econnessione/shared/tests/arbitrary/Keyword.arbitrary";
import { KeywordEntity } from "@entities/Keyword.entity";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";

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
        })
    ).body.data;
  });

  afterAll(async () => {
    await Test.ctx.db.delete(KeywordEntity, [keyword.id])();
    await Test.ctx.db.close()();
  });

  test("Should return a 401", async () => {
    const response = await Test.req
      .delete(`/v1/keywords/${keyword.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
  });
});
