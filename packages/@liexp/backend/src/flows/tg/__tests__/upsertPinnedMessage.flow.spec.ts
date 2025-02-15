import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { ActorEntity } from "../../../entities/Actor.entity.js";
import { EventV2Entity } from "../../../entities/Event.v2.entity.js";
import { KeywordEntity } from "../../../entities/Keyword.entity.js";
import { mockedContext } from "../../../test/context.js";
import { mocks } from "../../../test/mocks.js";
import {
  toPinnedMessage,
  upsertPinnedMessage,
  type UpsertPinnerMessageFlowContext,
} from "../upsertPinnedMessage.flow.js";

describe("Upsert Pinned Message Flow", () => {
  const Test = {
    ctx: mockedContext<UpsertPinnerMessageFlowContext>({
      db: mockDeep(),
      tg: mockDeep(),
    }),
  };

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
      socialPosts: [],
    }));

    await throwTE(Test.ctx.db.save(KeywordEntity, keywords));
    await throwTE(Test.ctx.db.save(EventV2Entity, events));
    await throwTE(
      Test.ctx.db.save(
        ActorEntity,
        actors.map((a) => ({
          ...a,
          avatar: undefined,
          memberIn: [],
          events: events.map((e) => e.id) as any[],
        })),
      ),
    );

    mocks.tg.upsertPinnedMessage.mockImplementationOnce(
      (text) => () => Promise.resolve(E.right({ message_id: 1, text })),
    );

    const result = await throwTE(upsertPinnedMessage(keywordCount)(Test.ctx));

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
