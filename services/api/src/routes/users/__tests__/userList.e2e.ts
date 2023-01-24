import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { fc } from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { UserEntity } from "@entities/User.entity";
import { hash } from "@utils/password.utils";

describe("User List", () => {
  let Test: AppTest;
  const adminId = uuid();
  const supporterId = uuid();
  const adminUsername = `${adminId}-admin@lies.exposed`;
  const supporterUsername = `${supporterId}-supporter@lies.exposed`;

  beforeAll(async () => {
    Test = GetAppTest();
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
          status: 'Approved',
          firstName: fc.sample(fc.string())[0],
          lastName: fc.sample(fc.string())[0],
        },
        {
          id: supporterId,
          username: supporterUsername,
          passwordHash: supporterPassword,
          email: supporterUsername,
          status: 'Approved',
          firstName: fc.sample(fc.string())[0],
          lastName: fc.sample(fc.string())[0],
        },
      ])
    );
  });

  test("Should return 200", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username: adminUsername,
      password: "admin-password",
    });

    expect(response.status).toEqual(201);

    const token = response.body.data.token;

    const getUserResponse = await Test.req
      .get("/v1/users")
      .set("authorization", token);

    expect(getUserResponse.status).toBe(200);
  });

  test("Should return 401", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username: supporterUsername,
      password: "supporter-password",
    });

    expect(response.status).toEqual(201);

    const token = response.body.data.token;

    const getUserResponse = await Test.req
      .get("/v1/users")
      .set("authorization", token);

    expect(getUserResponse.status).toBe(401);
  });
});
