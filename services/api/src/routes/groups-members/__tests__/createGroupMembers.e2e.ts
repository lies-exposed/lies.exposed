import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { type GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import {
  loginUser,
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary.js";
import { UUIDArb } from "@liexp/shared/lib/tests/arbitrary/common/UUID.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("Create Group Member", () => {
  let Test: AppTest;
  const users: UserTest[] = [];
  let authorizationToken: string;
  let actors: ActorEntity[];
  let groups: GroupEntity[];
  const groupsMembers: GroupMemberEntity[] = [];
  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    actors = tests.fc.sample(ActorArb, 1).map(toActorEntity);

    groups = tests.fc.sample(GroupArb, 1).map(toGroupEntity);

    await throwTE(Test.ctx.db.save(ActorEntity, actors));
    await throwTE(Test.ctx.db.save(GroupEntity, groups));
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401", async () => {
    const response = await Test.req.post("/v1/groups-members").send({
      group: tests.fc.sample(UUIDArb, 1)[0],
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 400", async () => {
    const response = await Test.req
      .post("/v1/groups-members")
      .set("Authorization", authorizationToken)
      .send({
        group: actors[0].id,
        actor: tests.fc.sample(UUIDArb, 1)[0],
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
        body: toInitialValue("this actor has been a member of this group"),
      });

    expect(response.status).toEqual(201);
    groupsMembers.push(response.body.data);
  });
});
