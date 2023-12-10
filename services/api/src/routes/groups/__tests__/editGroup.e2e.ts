import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser, saveUser } from "../../../../test/user.utils.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { UserEntity } from "#entities/User.entity.js";

describe("Edit Group", () => {
  let appTest: AppTest;
  const users: any[] = [];
  let authorizationToken: string;
  const actors = fc.sample(ActorArb, 10);
  const [group] = fc.sample(GroupArb, 1).map((g) => ({
    ...g,
    avatar: "",
    subGroups: [],
  }));

  beforeAll(async () => {
    appTest = await GetAppTest();
    const user = await saveUser(appTest, ["admin:create"]);
    users.push(user);
    await throwTE(appTest.ctx.db.save(ActorEntity, actors as any[]));

    await throwTE(appTest.ctx.db.save(GroupEntity, [group] as any[]));

    const { authorization } = await loginUser(appTest)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        ActorEntity,
        actors.map((a) => a.id),
      ),
    );
    await throwTE(appTest.ctx.db.delete(GroupEntity, [group.id]));
    await throwTE(
      appTest.ctx.db.delete(
        UserEntity,
        users.map((u) => u.id),
      ),
    );
    await appTest.utils.e2eAfterAll();
  });

  test("Should receive a 401 error", async () => {
    const updateData = {
      ...group,
      body: { content: "new group body" },
    };

    const response = await appTest.req
      .put(`/v1/groups/${group.id}`)
      .send(updateData)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  test("Should edit the group", async () => {
    const updateData = {
      ...group,
      body: { content: "new group body" },
    };

    const user = await saveUser(appTest, ["admin:edit"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);

    const response = await appTest.req
      .put(`/v1/groups/${group.id}`)
      .send(updateData)
      .set("Authorization", authorization);

    expect(response.status).toEqual(200);

    expect(response.body.data.body).toEqual({ content: "new group body" });
  });
});
