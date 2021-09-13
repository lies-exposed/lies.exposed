import * as tests from "@econnessione/core/tests";
import { ImageArb } from "@econnessione/shared/tests";
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
    const response = await Test.req.post("/v1/actors").send({
      username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
      avatar: tests.fc.sample(ImageArb, 1)[0],
      color: "ffffff",
      fullName: `${tests.fc.sample(
        tests.fc.string({ minLength: 3 })
      )} ${tests.fc.sample(tests.fc.string({ minLength: 3 }))}`,
      body: tests.fc.string(),
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 400", async () => {
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: "my content",
      });

    expect(response.status).toEqual(400);
  });

  test("Should create actor", async () => {
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: "my content",
      });

    expect(response.status).toEqual(201);
  });
});
