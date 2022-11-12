import * as fs from "fs";
import path from "path";
import { createExcerptValue } from "@liexp/shared/slate";
import { HumanReadableStringArb } from "@liexp/shared/tests/arbitrary/HumanReadableString.arbitrary";
import { URLArb } from "@liexp/shared/tests/arbitrary/URL.arbitrary";
import {
  TGMessageArb,
  TGPhotoArb,
} from "@liexp/shared/tests/arbitrary/common/TGMessage.arb";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { fc } from "@liexp/test";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { createFromTGMessage } from "@flows/event-suggestion/createFromTGMessage.flow";

const tempDir = path.resolve(__dirname, `../../../../temp/tg/media`);

describe("Create From TG Message", () => {
  let Test: AppTest;
  beforeAll(async () => {
    Test = await initAppTest();
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.close());
  });

  describe("createEventSuggestion", () => {
    test("succeeds when link is not yet present in db", async () => {
      const url = fc.sample(URLArb, 1)[0];
      const description = fc.sample(HumanReadableStringArb(), 1)[0];

      Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce({
        url,
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
        link: { id: expectedLink.id, description },
        photos: [],
        videos: [],
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

      await throwTE(Test.ctx.db.delete(LinkEntity, [link.id]));

      expect(result).toMatchObject({
        link: {
          id: link.id,
        },
      });
    });

    test("succeeds with a photo", async () => {
      const title = fc.sample(HumanReadableStringArb(), 1)[0];

      const [message] = fc.sample(TGMessageArb, 1).map((m) => ({
        ...m,
        photo: fc.sample(TGPhotoArb, 1),
        caption: title,
        caption_entities: [],
      }));

      Test.ctx.logger.debug.log("Message %O", message);

      // // create the media

      const tempFileLocation = path.resolve(
        tempDir,
        `${message.message_id}.png`
      );
      fs.writeFileSync(tempFileLocation, new Uint8Array(10));

      // mock tg download
      Test.mocks.tg.bot.downloadFile.mockImplementationOnce(() =>
        Promise.resolve(tempFileLocation)
      );

      // mock s3 upload
      Test.mocks.s3.upload().promise.mockImplementationOnce(() =>
        Promise.resolve({
          Key: fc.sample(fc.string(), 1)[0],
          Location: fc.sample(fc.webUrl(), 1)[0],
        })
      );

      const result = await throwTE(createFromTGMessage(Test.ctx)(message, {}));

      const { id, ...expectedExcerpt } = createExcerptValue(message.caption);
      expectedExcerpt.rows = expectedExcerpt.rows.map(
        ({ id, ...r }) => r
      ) as any[];

      const { creator, areas, ...media } = await throwTE(
        Test.ctx.db.findOneOrFail(MediaEntity, {
          where: { description: Equal(message.caption) },
        })
      );

      if (result.link?.id) {
        await throwTE(Test.ctx.db.delete(LinkEntity, [result.link?.id]));
      }

      await throwTE(
        Test.ctx.db.delete(MediaEntity, [
          ...result.photos.map((m) => m.id),
          ...result.videos.map((m) => m.id),
        ])
      );

      Test.ctx.logger.debug.log("Result %O", result);

      expect(result).toMatchObject({
        link: undefined,
        photos: [
          {
            ...media,
            events: [],
            links: [],
          },
        ],
        hashtags: [],
        videos: [],
      });
    });

    test.skip("succeeds with sample message #96", async () => {
      const message = pipe(
        fs.readFileSync(
          path.resolve(__dirname, "../../../../temp/tg/messages/96.json"),
          "utf-8"
        ),
        JSON.parse
      );

      Test.ctx.logger.debug.log("Message 96 %O", message);

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

      if (result.link?.id) {
        await throwTE(Test.ctx.db.delete(LinkEntity, [result.link?.id]));
      }

      await throwTE(
        Test.ctx.db.delete(MediaEntity, [
          ...result.photos.map((m) => m.id),
          ...result.videos.map((m) => m.id),
        ])
      );

      await throwTE(Test.ctx.db.delete(LinkEntity, [link.id]));

      expect(result).toMatchObject([
        {
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
        },
      ]);
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
        link: undefined,
        media: [media],
      });
    });
  });
});
