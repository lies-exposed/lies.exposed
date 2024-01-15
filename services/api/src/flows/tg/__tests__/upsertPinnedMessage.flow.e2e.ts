import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary.js";
import { ActorArb, UncategorizedArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import * as E from "fp-ts/lib/Either.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import {
  toPinnedMessage,
  upsertPinnedMessage,
} from "../upsertPinnedMessage.flow.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";

describe("Upsert Pinned Message Flow", () => {
  let Test: AppTest;
  beforeAll(async () => {
    Test = await GetAppTest();
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test.skip("Should upsert the message with 5 keywords", async () => {
    const keywordCount = 10;
    const actorCount = 10;
    const keywords = fc.sample(KeywordArb, keywordCount);
    const actors = fc.sample(ActorArb, actorCount);

    const events = fc.sample(UncategorizedArb, 10).map((e, i) => ({
      ...e,
      payload: {
        ...e.payload,
        actors: actors.map((a) => a.id),
      },
      links: [],
      media: [],
      keywords: i % 2 === 0 ? [keywords[0]] : [],
    }));

    await throwTE(Test.ctx.db.save(KeywordEntity, keywords));
    await throwTE(Test.ctx.db.save(EventV2Entity, events));
    await throwTE(
      Test.ctx.db.save(
        ActorEntity,
        actors.map((a) => ({
          ...a,
          memberIn: [],
          events: events.map((e) => e.id) as any[],
        })),
      ),
    );

    Test.mocks.tg.upsertPinnedMessage.mockImplementationOnce(
      (text) => () => Promise.resolve(E.right({ message_id: 1, text })),
    );

    const result = await throwTE(upsertPinnedMessage(Test.ctx)(keywordCount));

    await throwTE(
      Test.ctx.db.delete(
        EventV2Entity,
        events.map((e) => e.id),
      ),
    );

    await throwTE(
      Test.ctx.db.delete(
        KeywordEntity,
        keywords.map((k) => k.id),
      ),
    );

    await throwTE(
      Test.ctx.db.delete(
        ActorEntity,
        actors.map((a) => a.id),
      ),
    );

    expect(result).toMatchObject({
      message_id: 1,
      text: toPinnedMessage({
        bot: process.env.TG_BOT_USERNAME ?? "",
        keywords: [{ ...keywords[0], eventCount: keywordCount / 2 }],
        // actors: actors.map((a) => ({ ...a, eventCount: events.length })),
        keywordLimit: keywordCount,
        // actorLimit: actorCount,
      }),
    });
  });
});
