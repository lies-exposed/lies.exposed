import { loginUser, saveUser } from "@liexp/backend/lib/test/user.utils.js";
import { TagArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary.js";
import { ColorArb } from "@liexp/shared/lib/tests/arbitrary/common/Color.arbitrary.js";
import { fc } from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("Create Keyword", () => {
  let Test: AppTest;
  const users: any[] = [];
  let authorizationToken: string;

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401 when no Authorization header is present", async () => {
    const response = await Test.req.post("/v1/keywords").send({
      tag: "newkeyword",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 401 when token has no 'admin:create' permission' ", async () => {
    const user = await saveUser(Test.ctx, ["admin:read"]);
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
  });
});
