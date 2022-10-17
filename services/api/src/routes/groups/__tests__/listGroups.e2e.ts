import { fc } from "@liexp/core/tests";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@liexp/shared/tests/arbitrary/Group.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";

describe("List Groups", () => {
  let appTest: AppTest;
  let authorizationToken: string;
  let totalEvents: number;
  const actors = fc.sample(ActorArb, 10);
  const groups = fc.sample(GroupArb, 100);
  let groupMembers: any[];

  beforeAll(async () => {
    appTest = await initAppTest();

    await throwTE(appTest.ctx.db.save(ActorEntity, actors as any[]));

    await throwTE(appTest.ctx.db.save(GroupEntity, groups as any[]));

    groupMembers = pipe(
      groups,
      A.takeLeft(5),
      A.map((g) => ({
        actor: actors[0],
        group: g,
        startDate: new Date(),
        body: `${g.name} => ${actors[0].fullName}`,
      }))
    );

    await throwTE(appTest.ctx.db.save(GroupMemberEntity, groupMembers));
    totalEvents = await throwTE(appTest.ctx.db.count(GroupEntity));

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        GroupMemberEntity,
        groupMembers.map((g) => g.id)
      )
    );
    await throwTE(
      appTest.ctx.db.delete(
        ActorEntity,
        actors.map((a) => a.id)
      )
    );
    await throwTE(
      appTest.ctx.db.delete(
        GroupEntity,
        groups.map((g) => g.id)
      )
    );
    await throwTE(appTest.ctx.db.close());
  });

  test("Should return all groups", async () => {
    const response = await appTest.req
      .get(`/v1/groups`)
      .set("Authorization", authorizationToken);

    const { total } = response.body;

    expect(response.status).toEqual(200);

    expect(total).toBe(totalEvents);
  });

  test("Should return groups by given member", async () => {
    const response = await appTest.req
      .get(`/v1/groups`)
      .query({ "members[]": actors[0].id })
      .set("Authorization", authorizationToken);

    const { total } = response.body;

    expect(response.status).toEqual(200);
    expect(total).toBe(5);

    expect(response.body.data[0].members).toHaveLength(1);
  });
});
