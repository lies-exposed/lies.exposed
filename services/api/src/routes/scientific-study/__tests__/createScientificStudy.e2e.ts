import { fc } from "@econnessione/core/tests";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import { CreateScientificStudyArb } from "@econnessione/shared/tests/arbitrary/ScientificStudy.arbitrary";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { ScientificStudyEntity } from "@entities/ScientificStudy.entity";

describe("Create Scientific Study", () => {
  let appTest: AppTest;
  let authorizationToken: string;
  let scientificStudy: ScientificStudyEntity;
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
    await appTest.ctx.db.delete(ScientificStudyEntity, [scientificStudy.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
    await appTest.ctx.db.delete(GroupEntity, [group.id])();
    await appTest.ctx.db.close()();
  });

  test("Should create an event", async () => {
    const scientificStudyData = {
      ...fc.sample(CreateScientificStudyArb, 1)[0],
      authors: [actor.id],
      publisher: group.id,
      conclusion: "required"
    };

    const response = await appTest.req
      .post(`/v1/scientific-studies`)
      .set("Authorization", authorizationToken)
      .send(scientificStudyData);

    const body = response.body.data;
    expect(response.status).toEqual(201);

    expect(body.title).toBeDefined();
    expect(body).toMatchObject({
      authors: [actor.id],
      publisher: group.id,
    });

    scientificStudy = body;
  });
});
