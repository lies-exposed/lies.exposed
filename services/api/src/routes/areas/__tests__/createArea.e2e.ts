import { MediaArb } from "@liexp/shared/lib/tests";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";

describe("Create Area", () => {
  let Test: AppTest, user: any, authorizationToken: string;
  beforeAll(async () => {
    Test = await GetAppTest();

    user = await saveUser(Test, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401", async () => {
    const user = await saveUser(Test, ["admin:read"]);
    const { authorization } = await loginUser(Test)(user);
    const response = await Test.req
      .post("/v1/areas")
      .set("Authorization", authorization)
      .send({
        username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
        avatar: tests.fc.sample(MediaArb, 1)[0],
        color: "ffffff",
        fullName: `${tests.fc.sample(
          tests.fc.string({ minLength: 3 }),
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
      .send({
        color: "ffffff",
        label: tests.fc.sample(tests.fc.string())[0],
        slug: tests.fc.sample(tests.fc.string())[0],
        draft: tests.fc.sample(tests.fc.boolean())[0],
        excerpt: { content: "my content" },
        body: { content: "my content" },
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
      });

    expect(response.status).toEqual(201);
  });
});
