import { UncategorizedArb } from "@liexp/shared/tests/arbitrary/Event.arbitrary";
import { HumanReadableStringArb } from "@liexp/shared/tests/arbitrary/HumanReadableString.arbitrary";
import { URLArb } from "@liexp/shared/tests/arbitrary/URL.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { createExcerptValue } from "@liexp/ui/components/Common/Editor";
import * as fc from "fast-check";
import { AppTest, initAppTest } from "../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { LinkEntity } from "@entities/Link.entity";
import { createFromTGMessage } from "@helpers/event-suggestion/createFromTGMessage.helper";

describe("Event Suggestion Helper", () => {
  let Test: AppTest;
  beforeAll(async () => {
    Test = await initAppTest();
  });

  afterAll(async () => {
    await Test.ctx.db.close()();
  });

  describe("createEventSuggestion", () => {
    test("succeeds when link is not yet present in db", async () => {
      const url = fc.sample(URLArb, 1)[0];
      const description = fc.sample(HumanReadableStringArb(), 1)[0];

      Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce({
        description,
      });

      const result: any = await createFromTGMessage(Test.ctx)(
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
      )();

      const { id, ...expectedExcerpt } = createExcerptValue(description);
      expectedExcerpt.rows = expectedExcerpt.rows.map(
        ({ id, ...r }) => r
      ) as any[];

      expect(result.right).toMatchObject({
        status: "PENDING",
        payload: {
          type: "New",
          event: {
            type: "Uncategorized",
            excerpt: expectedExcerpt,
            links: [
              {
                url,
              },
            ],
          },
        },
      });

      await Test.ctx.db.delete(EventSuggestionEntity, [result.right.id])();
    });

    test.skip("succeeds when link is already present in db", async () => {
      const url = fc.sample(URLArb, 1)[0];
      const description = fc.sample(HumanReadableStringArb(), 1)[0];
      let link = {
        url,
        id: uuid(),
      };

      [link] = await throwTE(Test.ctx.db.save(LinkEntity, [link]));

      const events = fc.sample(UncategorizedArb, 1).map((e) => ({
        ...e,
        links: [link],
      }));

      await throwTE(Test.ctx.db.save(EventV2Entity, events as any));

      Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce({
        description,
      });

      const result: any = await throwTE(
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

      expect(result.left).toBe(undefined);
      expect(result.right).toMatchObject({
        type: "Uncategorized",
        links: [link.id],
      });

      await throwTE(
        Test.ctx.db.delete(
          EventV2Entity,
          events.map((e) => e.id)
        )
      );
      await throwTE(Test.ctx.db.delete(LinkEntity, [link.id]));
    });
  });
});
