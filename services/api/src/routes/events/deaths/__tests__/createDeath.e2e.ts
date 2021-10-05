import jwt from "jsonwebtoken";
import { fc } from "@econnessione/core/tests";
import { AppTest, initAppTest } from "../../../../../test/AppTest";
import { DeathEventEntity } from "../../../../entities/DeathEvent.entity";
import { ActorEntity } from "../../../../entities/Actor.entity";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";

describe("Create Death Event", () => {
  let appTest: AppTest,
    [actor] = fc.sample(ActorArb, 1),
    authorizationToken: string,
    deathEvent: DeathEventEntity;

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, [actor] as any[])();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.close()();
  });

  test("Should create an event", async () => {
    const deathData = {
      victim: actor.id,
      date: new Date().toISOString(),
    };

    const response = await appTest.req
      .post(`/v1/deaths`)
      .set("Authorization", authorizationToken)
      .send(deathData);

    const body = response.body.data;
    expect(response.status).toEqual(201);

    expect(body).toMatchObject({
      victim: actor.id,
    });

    deathEvent = body;
  });

  test.todo("Should create an event with images");
  test.todo("Should create an event with groups");
  test.todo("Should create an event with actors");
  test.todo("Should create an event with group members");

  afterAll(async () => {
    await appTest.ctx.db.delete(DeathEventEntity, [deathEvent.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
  });
});
