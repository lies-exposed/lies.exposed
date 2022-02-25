import { fc } from "@liexp/core/tests";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@liexp/shared/tests/arbitrary/Group.arbitrary";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";

describe("Edit Group", () => {
  let appTest: AppTest;
  let authorizationToken: string;
  const actors = fc.sample(ActorArb, 10);
  const [group] = fc.sample(GroupArb, 1).map((g) => ({
    ...g,
    avatar: "",
    subGroups: [],
  }));

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, actors as any[])();

    await appTest.ctx.db.save(GroupEntity, [group] as any[])();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.delete(
      ActorEntity,
      actors.map((a) => a.id)
    )();
    await appTest.ctx.db.delete(GroupEntity, [group.id])();
    await appTest.ctx.db.close()();
  });

  test("Should edit the group", async () => {
    const updateData = {
      ...group,
      body: { content: "new group body" },
    };

    const response = await appTest.req
      .put(`/v1/groups/${group.id}`)
      .send(updateData)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    expect(response.body.data.body).toEqual({ content: "new group body" });
  });
});
