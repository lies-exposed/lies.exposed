import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import fc from "fast-check";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Edit Group", () => {
  let appTest: AppTest;
  const users: any[] = [];
  let authorizationToken: string;
  const actors = fc.sample(ActorArb, 10).map((a) => ({
    ...a,
    memberIn: [],
    nationalities: [],
  }));
  const [group] = fc.sample(GroupArb, 1).map((g) => ({
    ...g,
    avatar: undefined,
    subGroups: [],
    members: [],
  }));

  beforeAll(async () => {
    appTest = await GetAppTest();
    const user = await saveUser(appTest.ctx, ["admin:create"]);
    users.push(user);

    await throwTE(appTest.ctx.db.save(ActorEntity, actors));
    await throwTE(appTest.ctx.db.save(GroupEntity, [group]));

    const { authorization } = await loginUser(appTest)(user);
    authorizationToken = authorization;
  });

  test("Should receive a 401 error", async () => {
    const updateData = {
      ...group,
      body: toInitialValue("new group body"),
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
      avatar: actors[0].avatar?.id,
      body: toInitialValue("new group body"),
    };

    const user = await saveUser(appTest.ctx, ["admin:edit"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);

    const response = await appTest.req
      .put(`/v1/groups/${group.id}`)
      .send(updateData)
      .set("Authorization", authorization);

    expect(response.status).toEqual(200);

    expect(response.body.data.body).toMatchObject([
      {
        type: "paragraph",
        content: [{ text: "new group body", styles: {}, type: "text" }],
      },
    ]);
  });
});
