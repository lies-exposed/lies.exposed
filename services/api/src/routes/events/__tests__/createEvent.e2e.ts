import { pipe } from "@liexp/core/lib/fp/index.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/index.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { CreateEventBodyArb } from "@liexp/shared/lib/tests/arbitrary/Event.arbitrary.js";
import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { fc } from "@liexp/test";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser, saveUser } from "../../../../test/user.utils.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";

describe("Create Event", () => {
  let appTest: AppTest;
  const users: any[] = [];
  let authorizationToken: string;

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
    appTest = await GetAppTest();
    const user = await saveUser(appTest, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);
    authorizationToken = authorization;
    await throwTE(appTest.ctx.db.save(ActorEntity, actors as any[]));
    await throwTE(appTest.ctx.db.save(KeywordEntity, keywords));
  });

  afterAll(async () => {
    const evKeywords = await pipe(
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
          [],
        ),
      ),
      throwTE,
    );

    await throwTE(appTest.ctx.db.delete(EventV2Entity, eventIds));
    await throwTE(appTest.ctx.db.delete(ActorEntity, actorIds));
    if (evKeywords.length) {
      await throwTE(
        appTest.ctx.db.delete(KeywordEntity, [
          ...evKeywords,
          ...keywords.map((k) => k.id),
        ]),
      );
    }
    await appTest.utils.e2eAfterAll();
  });

  test("Should create an event", async () => {
    const eventData = {
      ...fc.sample(CreateEventBodyArb({}), 1)[0],
      keywords: pipe(
        keywords,
        A.takeLeft(3),
        A.map((k) => k.id),
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

  test(`Should create a ${EventTypes.QUOTE.value} event `, async () => {
    const eventData = {
      date: new Date().toISOString(),
      draft: false,
      type: EventTypes.QUOTE.value,
      payload: {
        quote: fc.sample(fc.string(), 1)[0],
        actor: actors[0].id,
      },
      media: [],
      keywords: [],
      links: [],
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    const decodedBody = http.Events.Quote.Quote.decode(body);

    expect(response.status).toEqual(201);

    expect(decodedBody._tag).toEqual("Right");
    event = response.body.data;
    eventIds.push(event.id);
  });
});
