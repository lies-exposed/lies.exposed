import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { hash } from "@liexp/backend/lib/utils/password.utils.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import fc from "fast-check";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("GET User Me", () => {
  let Test: AppTest;
  const adminId = uuid();
  const supporterId = uuid();
  const adminUsername = `${adminId}-admin@lies.exposed`;
  const supporterUsername = `${supporterId}-supporter@lies.exposed`;

  beforeAll(async () => {
    Test = await GetAppTest();
    const adminPassword = await throwTE(hash("admin-password"));
    const supporterPassword = await throwTE(hash("supporter-password"));

    await throwTE(
      Test.ctx.db.save(UserEntity, [
        {
          id: adminId,
          username: adminUsername,
          passwordHash: adminPassword,
          email: adminUsername,
          permissions: ["admin:read"],
          status: "Approved",
          firstName: fc.sample(fc.string())[0],
          lastName: fc.sample(fc.string())[0],
        },
        {
          id: supporterId,
          username: supporterUsername,
          passwordHash: supporterPassword,
          email: supporterUsername,
          status: "Approved",
          firstName: fc.sample(fc.string())[0],
          lastName: fc.sample(fc.string())[0],
        },
      ]),
    );
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return 401 when no authorization token is given", async () => {
    await Test.req.get("/v1/users/me").expect(401);
  });

  test("Should return 401 when authorization token is wrong", async () => {
    await Test.req
      .get("/v1/users/me")
      .set("authorization", "wrong-token")
      .expect(401);
  });

  test("Should return 200 for admin", async () => {
    const response = await Test.req
      .post("/v1/users/login")
      .send({
        username: adminUsername,
        password: "admin-password",
      })
      .expect(201);

    const token = response.body.data.token;

    const getUserResponse = await Test.req
      .get("/v1/users/me")
      .set("authorization", token);

    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body.data).toMatchObject({
      id: adminId,
    });
  });

  test("Should return 200 for supporter", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username: supporterUsername,
      password: "supporter-password",
    });

    expect(response.status).toEqual(201);

    const token = response.body.data.token;

    const getUserResponse = await Test.req
      .get("/v1/users/me")
      .set("authorization", token);

    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body.data).toMatchObject({
      id: supporterId,
    });
  });
});
