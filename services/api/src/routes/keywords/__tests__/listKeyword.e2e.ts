import { http } from "@liexp/shared/io";
import { KeywordArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as tests from "@liexp/test";
import { AppTest, GetAppTest } from "../../../../test/AppTest";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("List Keywords", () => {
  let Test: AppTest,
    authorizationToken: string,
    keywords: http.Keyword.Keyword[];
  beforeAll(async () => {
    Test = GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    keywords = tests.fc.sample(KeywordArb, 50);

    await throwTE(
      Test.ctx.db.save(
        KeywordEntity,
        keywords.map((a) => ({
          ...a,
          memberIn: [],
          death: undefined,
        }))
      )
    );
  });

  afterAll(async () => {
    await throwTE(
      Test.ctx.db.delete(
        KeywordEntity,
        keywords.map((a) => a.id)
      )
    );
  });

  test("Should list keywords", async () => {
    const response = await Test.req
      .get("/v1/keywords")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
    expect(response.body.total).toBeGreaterThanOrEqual(50);
  });
});
