import { ActorArb, GroupArb, MediaArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { pipe } from "fp-ts/lib/function.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser, saveUser } from "../../../../test/user.utils.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { UserEntity } from "#entities/User.entity.js";

describe("Edit Actor", () => {
  let Test: AppTest;
  let user: any;
  let authorizationToken: string;
  const [avatar] = tests.fc.sample(MediaArb, 1);
  let actor = tests.fc.sample(ActorArb, 1).map((a) => ({
    ...a,
    death: undefined,
    memberIn: [] as any[],
    avatar,
  }))[0];

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    await pipe(
      Test.ctx.db.save(MediaEntity, [
        {
          ...avatar,
          events: [],
          links: [],
          keywords: [],
          stories: [],
          socialPosts: [],
          areas: [],
          featuredInAreas: [],
          featuredInStories: [],
          creator: null,
        },
      ]),
      throwTE,
    );

    await throwTE(
      Test.ctx.db.save(ActorEntity, [
        {
          ...actor,
          avatar: actor.avatar?.id as any,
        },
      ]),
    );
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(ActorEntity, [actor.id]));
    await throwTE(Test.ctx.db.delete(UserEntity, [user.id]));
    await throwTE(Test.ctx.db.delete(MediaEntity, [avatar.id]));
    await Test.utils.e2eAfterAll();
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
      .send({ ...editActor, avatar: avatar?.id });

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
        avatar: {
          ...g.avatar,
          events: [],
          keywords: [],
          areas: [],
          stories: [],
          links: [],
          featuredIn: [],
          socialPosts: [],
          featuredInStories: [],
          creator: null,
        },
      }));

      await throwTE(Test.ctx.db.save(GroupEntity, groups));
      const memberIn = groups.map((g) => ({
        group: { id: g.id },
        actor: { id: actor.id },
      }));
      await throwTE(Test.ctx.db.save(GroupMemberEntity, memberIn));

      const getActor = await Test.req
        .get(`/v1/actors/${actor.id}`)
        .set("Authorization", authorizationToken)
        .expect(200);

      expect(getActor.body.data.memberIn).toHaveLength(10);

      const otherGroups = tests.fc.sample(GroupArb, 10).map((g) => ({
        ...g,
        members: [],
        avatar: null,
      }));

      await throwTE(Test.ctx.db.save(GroupEntity, otherGroups));
      const alsoMemberIn = groups.map((g) => ({
        group: g.id,
        actor: actor.id,
        body: [{ type: "paragraph", content: "hello" }],
        startDate: new Date(),
        endDate: new Date(),
      }));

      const response = await Test.req
        .put(`/v1/actors/${actor.id}`)
        .set("Authorization", authorizationToken)
        .send({ memberIn: getActor.body.data.memberIn.concat(alsoMemberIn) });

      expect(response.status).toEqual(200);
      expect(response.body.data).toMatchObject({
        username: actor.username,
        body: actor.body,
        excerpt: actor.excerpt,
      });
      expect(response.body.data.memberIn).toHaveLength(20);

      await throwTE(
        Test.ctx.db.delete(GroupMemberEntity, response.body.data.memberIn),
      );
      await throwTE(
        Test.ctx.db.delete(GroupEntity, [
          ...groups.map((g) => g.id),
          ...otherGroups.map((g) => g.id),
        ]),
      );
    });
  });
});
