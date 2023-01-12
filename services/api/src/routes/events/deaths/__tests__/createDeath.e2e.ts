import { http } from "@liexp/shared/io";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { fc } from "@liexp/test";
import { ActorEntity } from "@entities/Actor.entity";
import { AppTest, GetAppTest } from "../../../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { loginUser, saveUser } from "../../../../../test/user.utils";
import { UserEntity } from "@entities/User.entity";

describe("Create Death Event", () => {
  let appTest: AppTest;
    const users: any[] = [];
  const [actor] = fc.sample(ActorArb, 1);

  let deathEvent: EventV2Entity;

  beforeAll(async () => {
    appTest = GetAppTest();
    await throwTE(appTest.ctx.db.save(ActorEntity, [actor] as any[]));
  });

  test("Should create a death event", async () => {
    const user = await saveUser(appTest, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);

    const deathData = {
      type: http.Events.Death.DEATH.value,
      payload: {
        victim: actor.id,
        body: {},
      },
      date: new Date().toISOString(),
      excerpt: {},
      draft: false,
      keywords: [],
      links: [],
      media: [],
    };

    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorization)
      .send(deathData);

    const body = response.body.data;
    expect(response.status).toEqual(201);

    expect(body).toMatchObject({
      type: http.Events.Death.DEATH.value,
      date: deathData.date,
      payload: {
        victim: actor.id,
      },
    });

    deathEvent = body;
  });

  test.todo("Should create an event with media");
  test.todo("Should create an event with groups");
  test.todo("Should create an event with actors");
  test.todo("Should create an event with group members");

  afterAll(async () => {
    await throwTE(appTest.ctx.db.delete(EventV2Entity, [deathEvent.id]));
    await throwTE(appTest.ctx.db.delete(ActorEntity, [actor.id]));
    await throwTE(
      appTest.ctx.db.delete(
        UserEntity,
        users.map((u) => u.id)
      )
    );
  });
});
