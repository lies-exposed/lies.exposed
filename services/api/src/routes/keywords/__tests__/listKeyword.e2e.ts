import * as tests from "@econnessione/core/tests";
import { http } from "@econnessione/shared/io";
import { KeywordArb } from "@econnessione/shared/tests/arbitrary/Keyword.arbitrary";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("List Keywords", () => {
  let Test: AppTest, authorizationToken: string, keywords: http.Keyword.Keyword[];
  beforeAll(async () => {
    Test = await initAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    keywords = tests.fc.sample(KeywordArb, 100);

    await Test.ctx.db.save(
      KeywordEntity,
      keywords.map((a) => ({
        ...a,
        memberIn: [],
        death: undefined,
      }))
    )();
  });

  afterAll(async () => {
    await Test.ctx.db.delete(
      KeywordEntity,
      keywords.map((a) => a.id)
    )();
    await Test.ctx.db.close()();
  });

  test("Should list keywords", async () => {
    const response = await Test.req
      .get("/v1/keywords")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
    expect(response.body.total).toBe(100);
  });
});
