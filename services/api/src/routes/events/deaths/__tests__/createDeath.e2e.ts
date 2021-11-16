import { fc } from "@econnessione/core/tests";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../../test/AppTest";
import { ActorEntity } from "../../../../entities/Actor.entity";
import { DeathEventEntity } from "../../../../entities/DeathEvent.entity";

describe("Create Death Event", () => {
  let appTest: AppTest;
  const [actor] = fc.sample(ActorArb, 1);
  let authorizationToken: string;
  let deathEvent: DeathEventEntity;

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

  test.todo("Should create an event with media");
  test.todo("Should create an event with groups");
  test.todo("Should create an event with actors");
  test.todo("Should create an event with group members");

  afterAll(async () => {
    await appTest.ctx.db.delete(DeathEventEntity, [deathEvent.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
  });
});
