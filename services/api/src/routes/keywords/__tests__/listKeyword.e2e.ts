import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("List Keywords", () => {
  let Test: AppTest,
    authorizationToken: string,
    keywords: http.Keyword.Keyword[];
  beforeAll(async () => {
    Test = await GetAppTest();
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
          socialPosts: [],
          death: undefined,
        })),
      ),
    );
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
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
