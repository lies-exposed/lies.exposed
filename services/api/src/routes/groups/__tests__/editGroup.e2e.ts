import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { loginUser, saveUser } from "@liexp/backend/lib/test/user.utils.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { fc } from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("Edit Group", () => {
  let appTest: AppTest;
  const users: any[] = [];
  let authorizationToken: string;
  const actors = fc.sample(ActorArb, 10);
  const [group] = fc.sample(GroupArb, 1).map((g) => ({
    ...g,
    avatar: undefined,
    subGroups: [],
  }));
  const media = [...actors.map((a) => a.avatar), group.avatar].filter(
    (m): m is Media.Media => !!m,
  );

  beforeAll(async () => {
    appTest = await GetAppTest();
    const user = await saveUser(appTest.ctx, ["admin:create"]);
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

    const mediaIds = media.map((m) => m.id);

    await throwTE(appTest.ctx.db.delete(MediaEntity, mediaIds));
    await appTest.utils.e2eAfterAll();
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
