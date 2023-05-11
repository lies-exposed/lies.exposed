import { type Actor } from "@liexp/shared/lib/io/http";
import { ActorArb } from "@liexp/shared/lib/tests";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { ActorEntity } from "@entities/Actor.entity";

describe("Create Actor", () => {
  let Test: AppTest, authorizationToken: string, user;
  const actorIds: string[] = [];

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(ActorEntity, actorIds));
    await Test.utils.e2eAfterAll();
  });

  test("Should return a 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/actors").send({
      username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
      avatar: "http://myavatar-url.com/",
      color: "ffffff",
      fullName: tests.fc.sample(tests.fc.string())[0],
      body: "my content",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return a 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string())[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: "my content",
      });

    expect(response.status).toEqual(401);
  });

  test("Should return a 400 when 'username' is not provided", async () => {
    user = await saveUser(Test, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string())[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: "my content",
      });

    expect(response.status).toEqual(400);
  });

  test("Should create actor", async () => {
    const response = await Test.req
      .post("/v1/actors")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string({ minLength: 6 }), 1)[0],
        avatar: "http://myavatar-url.com/",
        color: "ffffff",
        fullName: tests.fc.sample(tests.fc.string())[0],
        body: { content: "my content" },
        excerpt: { content: "my excerpt" },
      });

    expect(response.status).toEqual(201);

    actorIds.push(response.body.data.id);
  });

  test("Should create 2 parent actors and their 3 children ", async () => {
    const actorsData = tests.fc
      .sample(ActorArb, 5)
      .map((a) => ({ ...a, memberIn: [] }));

    const createActorReq = (d: any) =>
      Test.req
        .post("/v1/actors")
        .set("Authorization", authorizationToken)
        .send(d)
        .then((r) => r.body.data);

    const actors: Actor.Actor[] = await Promise.all(
      actorsData.map(createActorReq)
    );

    const family = {
      subject: actors[0].id,
      partner: actors[1].id,
      when: new Date(),
      children: [actors[2].id, actors[3].id, actors[4].id],
    };

    const actorFamilyTree = await Test.req
      .put(`/v1/actors/${actors[1].id}/family-tree`)
      .set("Authorization", authorizationToken)
      .send({ ...actors[1], family })
      .then((r) => r.body.data);

    Test.ctx.logger.debug.log(`Family tree %O`, actorFamilyTree);

    actorIds.push(...actors.map((a) => a.id));
  });
});
