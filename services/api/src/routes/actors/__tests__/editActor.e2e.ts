import * as tests from "@econnessione/core/tests";
import { ActorArb, GroupArb } from "@econnessione/shared/tests";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";

describe("Edit Actor", () => {
  let Test: AppTest;
  let authorizationToken: string;
  let actor = tests.fc.sample(ActorArb, 1).map((a) => ({
    ...a,
    death: undefined,
    memberIn: [] as any[],
  }))[0];

  beforeAll(async () => {
    Test = await initAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    await Test.ctx.db.save(ActorEntity, [actor])();
  });

  afterAll(async () => {
    await Test.ctx.db.delete(ActorEntity, [actor.id])();
    await Test.ctx.db.close()();
  });

  test("Should return a 401", async () => {
    const editActor = tests.fc.sample(ActorArb, 1)[0];

    await Test.req.put(`/v1/actors/${actor.id}`).send(editActor).expect(401);
  });

  test("Should return a 400", async () => {
    const response = await Test.req
      .put(`/v1/actors/${actor.id}`)
      .set("Authorization", authorizationToken)
      .send({
        memberIn: [{ notARealProperty: "new-username" }],
      });

    expect(response.status).toEqual(400);
  });

  test("Should edit the actor", async () => {
    const editActor = tests.fc.sample(ActorArb, 1)[0];
    const response = await Test.req
      .put(`/v1/actors/${actor.id}`)
      .set("Authorization", authorizationToken)
      .send(editActor);

    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      username: editActor.username,
      body: editActor.body,
      excerpt: editActor.excerpt,
    });
    actor = response.body.data;
  });

  describe("Edit Actor relations", () => {
    test("Should edit actor groups", async () => {
      const groups = tests.fc.sample(GroupArb, 10).map((g) => ({
        ...g,
        members: [],
      }));

      await Test.ctx.db.save(GroupEntity, groups)();
      const memberIn = groups.map((g) => ({
        group: { id: g.id },
        actor: { id: actor.id },
      }));
      await Test.ctx.db.save(GroupMemberEntity, memberIn)();

      const getActor = await Test.req
        .get(`/v1/actors/${actor.id}`)
        .set("Authorization", authorizationToken)
        .expect(200);

      expect(getActor.body.data.memberIn).toHaveLength(10);

      const otherGroups = tests.fc.sample(GroupArb, 10).map((g) => ({
        ...g,
        members: [],
      }));

      await Test.ctx.db.save(GroupEntity, otherGroups)();
      const alsoMemberIn = groups.map((g) => ({
        group: g.id,
        actor: actor.id,
        body: {},
        startDate: new Date(),
        endDate: new Date(),
      }));

      const response = await Test.req
        .put(`/v1/actors/${actor.id}`)
        .set("Authorization", authorizationToken)
        .send({ memberIn: getActor.body.data.memberIn.concat(alsoMemberIn) });

      console.log(response.body);

      expect(response.status).toEqual(200);
      expect(response.body.data).toMatchObject({
        username: actor.username,
        body: actor.body,
        excerpt: actor.excerpt,
      });
      expect(response.body.data.memberIn).toHaveLength(20);

      await Test.ctx.db.delete(
        GroupMemberEntity,
        response.body.data.memberIn
      )();
      await Test.ctx.db.delete(GroupEntity, [
        ...groups.map((g) => g.id),
        ...otherGroups.map((g) => g.id),
      ])();
    });
  });
});
