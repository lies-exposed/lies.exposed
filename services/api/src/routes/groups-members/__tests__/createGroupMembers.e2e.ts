import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@liexp/shared/tests/arbitrary/Group.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as tests from "@liexp/test";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";

describe("Create Group Member", () => {
  let Test: AppTest;
    const users: any[] = [];
    let authorizationToken: string;
    let actors: ActorEntity[];
    let groups: GroupEntity[];
    const groupsMembers: GroupMemberEntity[] = [];
  beforeAll(async () => {
    Test = await initAppTest();
    const user = await saveUser(Test, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    actors = tests.fc.sample(ActorArb, 1).map((a) => ({
      ...a,
      death: undefined,
      memberIn: [],
    })) as any[];

    groups = tests.fc.sample(GroupArb, 1).map((g) => ({
      ...g,
      members: [],
    })) as any[];

    await throwTE(Test.ctx.db.save(ActorEntity, actors));
    await throwTE(Test.ctx.db.save(GroupEntity, groups));
  });

  afterAll(async () => {
    await throwTE(
      Test.ctx.db.delete(
        GroupMemberEntity,
        groupsMembers.map((g) => g.id)
      )
    );
    await throwTE(
      Test.ctx.db.delete(
        GroupEntity,
        groups.map((g) => g.id)
      )
    );
    await throwTE(
      Test.ctx.db.delete(
        ActorEntity,
        actors.map((a) => a.id)
      )
    );
    await throwTE(Test.ctx.db.close());
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
        body: { content: "this actor has been a member of this group" },
      });

    expect(response.status).toEqual(201);
    groupsMembers.push(response.body.data);
  });
});
