import * as fs from "fs";
import path from "path";
import { UncategorizedArb } from "@liexp/shared/tests/arbitrary/Event.arbitrary";
import { HumanReadableStringArb } from "@liexp/shared/tests/arbitrary/HumanReadableString.arbitrary";
import { URLArb } from "@liexp/shared/tests/arbitrary/URL.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { createExcerptValue } from "@liexp/ui/components/Common/Editor";
import * as fc from "fast-check";
import { pipe } from "fp-ts/lib/function";
import { AppTest, initAppTest } from "../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { createFromTGMessage } from "@helpers/event-suggestion/createFromTGMessage.helper";

describe("Event Suggestion Helper", () => {
  let Test: AppTest;
  beforeAll(async () => {
    Test = await initAppTest();
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.close());
  });

  describe("createEventSuggestion", () => {
    test("succeeds when link is not yet present in db", async () => {
      const url = fc.sample(URLArb, 1)[0];
      const description = fc.sample(HumanReadableStringArb(), 1)[0];

      Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce({
        description,
      });

      const result: any = await pipe(
        createFromTGMessage(Test.ctx)(
          {
            message_id: 1,
            text: url,
            date: new Date().getMilliseconds(),
            chat: { id: 1, type: "private" },
            entities: [
              {
                type: "url",
                offset: 0,
                length: url.length,
              },
            ],
          },
          {}
        ),
        throwTE
      );

      const { id, ...expectedExcerpt } = createExcerptValue(description);
      expectedExcerpt.rows = expectedExcerpt.rows.map(
        ({ id, ...r }) => r
      ) as any[];

      const expectedLink = await throwTE(
        Test.ctx.db.findOneOrFail(LinkEntity, { where: { url } })
      );

      expect(result).toMatchObject({
        status: "PENDING",
        payload: {
          type: "New",
          event: {
            type: "Uncategorized",
            excerpt: expectedExcerpt,
            links: [expectedLink.id],
          },
        },
      });

      await throwTE(Test.ctx.db.delete(EventSuggestionEntity, [result.id]));
    });

    test("succeeds when link is already present in db", async () => {
      const url = fc.sample(URLArb, 1)[0];
      const description = fc.sample(HumanReadableStringArb(), 1)[0];
      let link = {
        url,
        description,
        id: uuid(),
      };

      [link] = await throwTE(Test.ctx.db.save(LinkEntity, [link]));

      let [event]: any[] = fc.sample(UncategorizedArb, 1).map((e) => ({
        ...e,
        links: [link],
      }));

      [event] = await throwTE(Test.ctx.db.save(EventV2Entity, [event] as any[]));

      const result = await throwTE(
        createFromTGMessage(Test.ctx)(
          {
            message_id: 1,
            text: url,
            date: new Date().getMilliseconds(),
            chat: { id: 1, type: "private" },
            entities: [
              {
                type: "url",
                offset: 0,
                length: url.length,
              },
            ],
          },
          {}
        )
      );

      expect(result).toMatchObject({
        id: event.id,
      });

      await throwTE(
        Test.ctx.db.delete(
          EventV2Entity,
          event.id
        )
      );

      await throwTE(Test.ctx.db.delete(LinkEntity, [link.id]));
    });

    test.skip("succeeds with sample message #96", async () => {
      const message = pipe(
        fs.readFileSync(
          path.resolve(__dirname, "../../../temp/tg/messages/96.json"),
          "utf-8"
        ),
        JSON.parse
      );

      const title = fc.sample(HumanReadableStringArb(), 1)[0];
      const url = message.caption_entities[0].url;
      const description = message.caption;

      Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce({
        title,
        url,
        description,
      });

      const result = await throwTE(createFromTGMessage(Test.ctx)(message, {}));

      const link = await throwTE(
        Test.ctx.db.findOneOrFail(LinkEntity, {
          where: {
            url,
          },
        })
      );

      expect(link).toMatchObject({
        url,
        description,
      });

      const { id, ...expectedExcerpt } = createExcerptValue(description);
      expectedExcerpt.rows = expectedExcerpt.rows.map(
        ({ id, ...r }) => r
      ) as any[];

      await throwTE(Test.ctx.db.delete(EventSuggestionEntity, [result.id]));
      await throwTE(Test.ctx.db.delete(LinkEntity, [link.id]));

      expect(result).toMatchObject({
        status: "PENDING",
        payload: {
          type: "New",
          event: {
            type: "Uncategorized",
            excerpt: expectedExcerpt,
            payload: {
              title,
              groups: [],
              groupsMembers: [],
              actors: [],
            },
            media: [],
            links: [link.id],
          },
        },
      });
    });

    test.skip("succeeds with sample message #95", async () => {
      const message = fs.readFileSync(
        path.resolve(__dirname, "../../../temp/tg/messages/95.json"),
        "utf-8"
      );

      const result = await throwTE(
        createFromTGMessage(Test.ctx)(JSON.parse(message), {})
      );

      const media = await throwTE(
        Test.ctx.db.findOneOrFail(MediaEntity, {
          where: { location: "https://youtu.be/zcDcz9rrfiE" },
        })
      );

      expect(media).toMatchObject({
        location: "https://youtu.be/zcDcz9rrfiE",
        description: `The Grand Deception Of 21st Century | Breaking Down The Fourth Wall\nStrangerThanFiction\n\nThe Hive Mind Consciousness. As Time Gets Closer, More Secrets Are Coming Out.\n\n“The greatest trick the Devil ever pulled was convincing the world he didn't exist.”`,
      });

      expect(result).toMatchObject({
        type: "New",
        event: {
          type: "Uncategorized",
          payload: {},
          links: [],
          media: [media.id],
        },
      });
    });
  });
});
