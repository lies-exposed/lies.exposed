import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import fc from "fast-check";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Create Death Event", () => {
  let appTest: AppTest;
  const users: any[] = [];
  const [actor] = fc.sample(ActorArb, 1).map((actor) => ({
    ...actor,
    memberIn: [],
    nationalities: [],
  }));

  let deathEvent: EventV2Entity;

  beforeAll(async () => {
    appTest = await GetAppTest();
    await throwTE(appTest.ctx.db.save(ActorEntity, [actor]));
  });

  afterAll(async () => {
    await throwTE(appTest.ctx.db.delete(EventV2Entity, [deathEvent.id]));
    await throwTE(appTest.ctx.db.delete(ActorEntity, [actor.id]));
    await throwTE(
      appTest.ctx.db.delete(
        UserEntity,
        users.map((u) => u.id),
      ),
    );
  });

  test("Should create a death event", async () => {
    const user = await saveUser(appTest.ctx, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);

    const deathData = {
      type: EVENT_TYPES.DEATH,
      payload: {
        victim: actor.id,
        body: {},
      },
      date: new Date().toISOString(),
      excerpt: toInitialValue("Death of an actor"),
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
      type: EVENT_TYPES.DEATH,
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
});
