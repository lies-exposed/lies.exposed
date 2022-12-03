import * as fs from "fs";
import path from "path";
import { createExcerptValue } from "@liexp/shared/slate";
import { HumanReadableStringArb } from "@liexp/shared/tests/arbitrary/HumanReadableString.arbitrary";
import { URLArb } from "@liexp/shared/tests/arbitrary/URL.arbitrary";
import {
  TGMessageArb,
  TGPhotoArb
} from "@liexp/shared/tests/arbitrary/common/TGMessage.arb";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { fc } from "@liexp/test";
import { pipe } from "fp-ts/function";
import TelegramBot from "node-telegram-bot-api";
import { Equal } from "typeorm";
import puppeteerMocks from "../../../../__mocks__/puppeteer.mock";
import { AppTest, GetAppTest } from "../../../../test/AppTest";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { createFromTGMessage } from "@flows/event-suggestion/createFromTGMessage.flow";

const tempDir = path.resolve(__dirname, `../../../../temp/tg/media`);

interface MessageTest {
  n: number;
  urls: (m: TelegramBot.Message) => any[];
  photos?: (m: TelegramBot.Message) => any[];
  videos?: (m: TelegramBot.Message) => any[];
}

describe("Create From TG Message", () => {
  let Test: AppTest;
  beforeAll(async () => {
    Test = GetAppTest();
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
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
        link: [{ id: expectedLink.id, description }],
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
        link: [
          {
            id: link.id,
          },
        ],
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

      if (result.link.length > 0) {
        await throwTE(
          Test.ctx.db.delete(
            LinkEntity,
            result.link?.map((l) => l.id)
          )
        );
      }

      await throwTE(
        Test.ctx.db.delete(MediaEntity, [
          ...result.photos.map((m) => m.id),
          ...result.videos.map((m) => m.id),
        ])
      );

      Test.ctx.logger.debug.log("Result %O", result);

      expect(result).toMatchObject({
        link: [],
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

    const messageCases: MessageTest[] = [
      {
        n: 95,
        urls(m) {
          return [{ url: m.caption_entities?.[1].url }];
        },
        videos(m) {
          return [
            {
              description: m.caption,
            },
          ];
        },
      },
      {
        n: 96,
        urls(m) {
          return [{ url: m.caption_entities?.[0].url, description: m.caption }];
        },
        photos(m) {
          return [{ description: m.caption }];
        },
      },
      {
        n: 97,
        urls(m) {
          return [
            {
              url: m.caption_entities?.[1].url,
            },
          ];
        },
        videos(m) {
          return [{ description: m.caption }];
        },
      },
      {
        n: 98,
        urls(m) {
          return [
            {
              url: m.caption?.slice(
                m.caption_entities?.[0].offset,
                m.caption_entities?.[0].length
              ),
            },
          ];
        },
        photos(m) {
          return [
            {
              description: m.caption,
            },
          ];
        },
      },
      {
        n: 99,
        urls: (m) => {
          return [{ url: m.caption_entities?.[1].url }];
        },
        videos: (m) => {
          return [{ description: m.caption }];
        },
      },
      {
        n: 100,
        urls: (message) => {
          const title = fc.sample(HumanReadableStringArb(), 1)[0];
          const url = message.caption;
          const description = message.caption;
          const first = {
            title,
            url,
            description,
          };
          return [first];
        },
        photos: () => [],
        videos: () => [],
      },
      {
        n: 101,
        urls: () => {
          return [];
        },
        videos(m) {
          return [{ description: m.caption }];
        },
      },
      {
        n: 102,
        urls: (m) => {
          return [{ url: m.text }];
        },
      },
      {
        n: 104,
        urls: (m) => {
          return [{ url: m.caption_entities?.[3].url }];
        },
        photos: (m) => {
          return [
            {
              description: m.caption,
            },
          ];
        },
      },
      {
        n: 106,
        urls: (m) => {
          return [
            {
              url: m.caption?.slice(
                m.caption_entities?.[0].offset,
                m.caption_entities?.[0].length
              ),
            },
          ];
        },
        photos: (m) => {
          return [
            {
              description: m.caption,
            },
          ];
        },
      },
      {
        n: 300,
        urls: (message) => {
          const title = fc.sample(HumanReadableStringArb(), 1)[0];
          const url = message.text;
          const description = message.caption;
          const first = {
            title,
            url,
            description,
          };

          return [first];
        },
      },
    ];
    // .filter((n: MessageTest) => [106].includes(n.n));

    test.skip.each(messageCases)(
      "Running message case $n",
      async (c: MessageTest) => {
        const message = pipe(
          fs.readFileSync(
            path.resolve(__dirname, `../../../../temp/tg/messages/${c.n}.json`),
            "utf-8"
          ),
          JSON.parse,
          (message) => ({
            ...message,
            from: fc.sample(
              fc.record({
                id: fc.nat(),
                is_bot: fc.boolean(),
                first_name: fc.string(),
                last_name: fc.string(),
                username: fc.string(),
                language_code: fc.constant("en"),
              })
            )[0],
            chat: fc.sample(
              fc.record({
                id: fc.nat(),
                first_name: fc.string(),
                last_name: fc.string(),
                username: fc.string(),
                type: fc.constant("private"),
              })
            )[0],
          })
        );

        Test.ctx.logger.debug.log("Message %O", message);

        const urls = c.urls(message);
        urls.forEach((m) => {
          Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce(m);
        });

        const photos = c.photos?.(message) ?? [];
        const videos = c.videos?.(message) ?? [];

        Test.ctx.logger.debug.log(
          "Photos and videos %d",
          photos.length + videos.length
        );
        Test.mocks.tg.bot.downloadFile.mockReset();
        Test.mocks.s3.upload().promise.mockReset();

        if (photos.length > 0 || videos.length > 0) {
          // // create the media

          photos.forEach((p) => {
            Test.ctx.logger.debug.log("Mock photo upload %O", p);
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

            puppeteerMocks.page.goto.mockReset().mockResolvedValueOnce({});
          });

          videos.forEach((p) => {
            Test.ctx.logger.debug.log("Mock video upload %O", p);
            const tempFileLocation = path.resolve(
              tempDir,
              `${message.message_id}.png`
            );

            fs.writeFileSync(tempFileLocation, new Uint8Array(10));

            // mock tg download
            Test.mocks.tg.bot.downloadFile
              .mockImplementationOnce(() => Promise.resolve(tempFileLocation))
              .mockImplementationOnce(() => Promise.resolve(tempFileLocation));

            // mock s3 upload
            Test.mocks.s3
              .upload()
              .promise.mockImplementationOnce((args) => {
                Test.ctx.logger.debug.log("Upload %O", args);
                return Promise.resolve({
                  Key: fc.sample(fc.string(), 1)[0],
                  Location: fc.sample(
                    fc
                      .string({ minLength: 10, maxLength: 12 })
                      .map((id) => `https://youtube.com/watch?v=${id}`),
                    1
                  )[0],
                });
              })
              .mockImplementationOnce(() =>
                Promise.resolve({
                  Key: fc.sample(fc.string(), 1)[0],
                  Location: fc.sample(
                    fc
                      .string({ minLength: 10, maxLength: 12 })
                      .map((id) => `https://youtube.com/watch?v=${id}`),
                    1
                  )[0],
                })
              );

            puppeteerMocks.page.goto.mockReset().mockResolvedValueOnce({});
            puppeteerMocks.page.waitForSelector.mockReset().mockResolvedValueOnce({});
            puppeteerMocks.page.$eval.mockReset().mockResolvedValueOnce({});
          });
        }

        const result = await throwTE(
          createFromTGMessage(Test.ctx)(message, {})
        );

        expect(result.link).toMatchObject(
          urls.map((url) => ({
            ...url,
            description: url.description ?? null,
          }))
        );
        expect(result.photos).toMatchObject(photos);
        expect(result.videos).toMatchObject(videos);

        if (result.link.length > 0) {
          await throwTE(
            Test.ctx.db.delete(
              LinkEntity,
              result.link.map((p) => p.id)
            )
          );
        }

        if (result.photos.length > 0 || result.videos.length > 0) {
          await throwTE(
            Test.ctx.db.delete(MediaEntity, [
              ...result.photos.map((p) => p.id),
              ...result.videos.map((v) => v.id),
            ])
          );
        }
      }
    );
  });
});
