import { fc } from "@econnessione/core/tests";
import * as http from "@econnessione/shared/io/http";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { CreateEventBodyArb } from "@econnessione/shared/tests/arbitrary/Event.arbitrary";
import { KeywordArb } from "@econnessione/shared/tests/arbitrary/Keyword.arbitrary";
import * as A from "fp-ts/lib/Array";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import jwt from "jsonwebtoken";
import { In } from "typeorm";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("Create Event", () => {
  let appTest: AppTest, authorizationToken: string;

  let event: http.Events.Uncategorized.Uncategorized;
  const keywords = fc.sample(KeywordArb, 5);
  const actors = fc.sample(ActorArb, 3).map((a) => ({
    ...a,
    memberIn: [],
    death: undefined,
  }));
  const eventIds: string[] = [];
  let actorIds: string[] = [];

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, actors as any[])();
    await appTest.ctx.db.save(KeywordEntity, keywords)();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  test("Should create an event", async () => {
    const eventData = {
      ...fc.sample(CreateEventBodyArb({}), 1)[0],
      keywords: pipe(
        keywords,
        A.takeLeft(3),
        A.map((k) => k.id)
      ),
      media: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      links: [],
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    const decodedBody = http.Events.Uncategorized.Uncategorized.decode(body);

    expect(response.status).toEqual(201);

    expect(decodedBody._tag).toEqual("Right");
    event = response.body.data;
    eventIds.push(event.id);
  });

  test("Should create an event with actors", async () => {
    actorIds = actors.map((a) => a.id);

    const eventData = {
      ...fc.sample(CreateEventBodyArb({}), 1)[0],
      media: [],
      keywords: [],
      groups: [],
      groupsMembers: [],
      links: [],
      actors: actorIds,
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    const decodedBody = http.Events.Uncategorized.Uncategorized.decode(body);

    expect(response.status).toEqual(201);

    expect(decodedBody._tag).toEqual("Right");
    event = response.body.data;
    eventIds.push(event.id);
  });

  test.todo("Should create an event with media");
  test.todo("Should create an event with groups");
  test.todo("Should create an event with group members");

  afterAll(async () => {
    const keywords = (
      (await pipe(
        appTest.ctx.db.find(EventV2Entity, {
          loadRelationIds: {
            relations: ["keywords"],
          },
          where: {
            id: In(eventIds),
          },
        }),
        TE.map((events) =>
          events.reduce<string[]>(
            (acc, e) => acc.concat(e.keywords as any[] as string[]),
            []
          )
        )
      )()) as any
    ).right;

    await appTest.ctx.db.delete(EventV2Entity, eventIds)();
    await appTest.ctx.db.delete(ActorEntity, actorIds)();
    await appTest.ctx.db.delete(KeywordEntity, keywords)();

    await appTest.ctx.db.close()();
  });
});
