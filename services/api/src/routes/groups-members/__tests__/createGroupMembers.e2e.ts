import * as tests from "@econnessione/core/tests";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("Create Group Member", () => {
  let authorizationToken: string;
  let Test: AppTest;
  let actors: ActorEntity[];
  let groups: GroupEntity[];
  const groupsMembers: GroupMemberEntity[] = [];
  beforeAll(async () => {
    Test = await initAppTest();
    actors = tests.fc.sample(ActorArb, 1).map((a) => ({
      ...a,
      death: undefined,
      memberIn: [],
    })) as any[];

    groups = tests.fc.sample(GroupArb, 1).map((g) => ({
      ...g,
      members: [],
    })) as any[];

    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
    await Test.ctx.db.save(ActorEntity, actors)();
    await Test.ctx.db.save(GroupEntity, groups)();
  });

  afterAll(async () => {
    await Test.ctx.db.delete(
      GroupMemberEntity,
      groupsMembers.map((g) => g.id)
    )();
    await Test.ctx.db.delete(
      GroupEntity,
      groups.map((g) => g.id)
    )();
    await Test.ctx.db.delete(
      ActorEntity,
      actors.map((a) => a.id)
    )();
    await Test.ctx.db.close()();
  });

  test("Should return a 401", async () => {
    const response = await Test.req.post("/v1/groups-members").send({
      group: tests.fc.sample(tests.fc.uuid(), 1)[0],
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 400", async () => {
    const response = await Test.req
      .post("/v1/groups-members")
      .set("Authorization", authorizationToken)
      .send({
        group: actors[0].id,
        actor: tests.fc.sample(tests.fc.uuid(), 1)[0],
      });

    expect(response.status).toEqual(400);
  });

  test("Should create group member", async () => {
    const response = await Test.req
      .post("/v1/groups-members")
      .set("Authorization", authorizationToken)
      .send({
        actor: actors[0].id,
        group: groups[0].id,
        startDate: new Date().toISOString(),
        body: "this actor has been a member of this group",
      });

    expect(response.status).toEqual(201);
    groupsMembers.push(response.body.data);
  });
});
