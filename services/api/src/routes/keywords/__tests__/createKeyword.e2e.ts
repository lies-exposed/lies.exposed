import { fc } from "@liexp/core/tests";
import { http } from "@liexp/shared/io";
import { TagArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import { ColorArb } from "@liexp/shared/tests/arbitrary/common/Color.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("Create Keyword", () => {
  let Test: AppTest, authorizationToken: string, keyword: http.Keyword.Keyword;

  beforeAll(async () => {
    Test = await initAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(KeywordEntity, keyword.id));
    await throwTE(Test.ctx.db.close());
  });

  test("Should return a 401", async () => {
    const response = await Test.req.post("/v1/keywords").send({
      tag: "newkeyword",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 400", async () => {
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        tag: "invalid keyword",
      });

    expect(response.status).toEqual(400);
  });

  test("Should create a keyword", async () => {
    const response = await Test.req
      .post("/v1/keywords")
      .set("Authorization", authorizationToken)
      .send({
        tag: fc.sample(TagArb(), 1)[0],
        color: fc.sample(ColorArb, 1)[0],
      });

    expect(response.status).toEqual(201);
    keyword = response.body.data;
  });
});
