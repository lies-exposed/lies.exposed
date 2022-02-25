import * as tests from "@liexp/core/tests";
import { MediaArb } from "@liexp/shared/tests";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("Create Area", () => {
  let Test: AppTest, authorizationToken: string;
  beforeAll(async () => {
    Test = await initAppTest();

    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
  });

  afterAll(async () => {
    await Test.ctx.db.close()();
  });

  test("Should return a 401", async () => {
    const response = await Test.req.post("/v1/areas").send({
      username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
      avatar: tests.fc.sample(MediaArb, 1)[0],
      color: "ffffff",
      fullName: `${tests.fc.sample(
        tests.fc.string({ minLength: 3 })
      )} ${tests.fc.sample(tests.fc.string({ minLength: 3 }))}`,
      excerpt: { content: tests.fc.string() },
      body: { content: tests.fc.string() },
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 400", async () => {
    const response = await Test.req
      .post("/v1/areas")
      .set("Authorization", authorizationToken)
      .send({
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        excerpt: { content: "my content" },
        body: { content: "my content" },
      });

    expect(response.status).toEqual(400);
  });

  test("Should create area", async () => {
    const response = await Test.req
      .post("/v1/areas")
      .set("Authorization", authorizationToken)
      .send({});

    expect(response.status).toEqual(400);
  });
});
