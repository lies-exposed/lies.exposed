import { fc } from "@liexp/core/tests";
import { http } from "@liexp/shared/io";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";

describe("Create Death Event", () => {
  let appTest: AppTest;
  const [actor] = fc.sample(ActorArb, 1);
  let authorizationToken: string;
  let deathEvent: EventV2Entity;

  beforeAll(async () => {
    appTest = await initAppTest();

    await throwTE(appTest.ctx.db.save(ActorEntity, [actor] as any[]));

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  test("Should create a death event", async () => {
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
      .set("Authorization", authorizationToken)
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
  });
});
