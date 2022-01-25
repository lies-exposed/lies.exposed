import { fc } from "@econnessione/core/tests";
import { ScientificStudyType } from "@econnessione/shared/io/http/Events/ScientificStudy";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import { CreateScientificStudyArb } from "@econnessione/shared/tests/arbitrary/ScientificStudy.arbitrary";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";

describe("Create Scientific Study", () => {
  let appTest: AppTest;
  let authorizationToken: string;
  let scientificStudy: EventV2Entity;
  const [actor] = fc.sample(ActorArb, 1);
  const [group] = fc.sample(GroupArb, 1);

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, [
      { ...actor, death: undefined, memberIn: [] },
    ])();
    await appTest.ctx.db.save(GroupEntity, [{ ...group, members: [] }])();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.delete(EventV2Entity, [scientificStudy.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
    await appTest.ctx.db.delete(GroupEntity, [group.id])();
    await appTest.ctx.db.close()();
  });

  test("Should create a scientific study", async () => {
    const scientificStudyData = fc
      .sample(CreateScientificStudyArb, 1)
      .map((s) => ({
        url: s.payload.url,
        // ...s,
        // payload: {
        //   ...s.payload,
        //   authors: [actor.id],
        //   publisher: group.id,
        // },
      }))[0];

    const response = await appTest.req
      .post(`/v1/scientific-studies`)
      .set("Authorization", authorizationToken)
      .send(scientificStudyData);

    const body = response.body.data;
    expect(response.status).toEqual(201);

    expect(body.type).toBe(ScientificStudyType.value);
    expect(body.date).toBeDefined();
    expect(body.payload.url).toBeDefined();
    expect(body.payload.title).toBeDefined();

    scientificStudy = body;
  });
});
