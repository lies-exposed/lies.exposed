import * as http from "@liexp/shared/lib/io/http";
import { Quote } from "@liexp/shared/lib/io/http/Events";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary";
import { CreateEventBodyArb } from "@liexp/shared/lib/tests/arbitrary/Event.arbitrary";
import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import * as A from "fp-ts/Array";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { In } from "typeorm";
import { GetAppTest, type AppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { KeywordEntity } from "@entities/Keyword.entity";

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

  test(`Should create a ${Quote.QUOTE.value} event `, async () => {
    const eventData = {
      date: new Date().toISOString(),
      draft: false,
      type: Quote.QUOTE.value,
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
