import { fc } from "@liexp/core/tests";
import { http } from "@liexp/shared/io";
import { TagArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import { ColorArb } from "@liexp/shared/tests/arbitrary/common/Color.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("Create Keyword", () => {
  let Test: AppTest;
    const users: any[] = [];
    let authorizationToken: string;
    let keyword: http.Keyword.Keyword;

  beforeAll(async () => {
    Test = await initAppTest();
    const user = await saveUser(Test, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(KeywordEntity, keyword.id));
    await throwTE(Test.ctx.db.close());
  });

  test("Should return a 401 when no Authorization header is present", async () => {
    const response = await Test.req.post("/v1/keywords").send({
      tag: "newkeyword",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 401 when token has no 'admin:create' permission' ", async () => {
    const user = await saveUser(Test, ["admin:read"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);

    const response = await Test.req
      .post("/v1/keywords")
      .set("Authorization", authorization)
      .send({
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
