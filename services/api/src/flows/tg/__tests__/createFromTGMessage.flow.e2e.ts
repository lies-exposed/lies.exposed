import * as fs from "fs";
import path from "path";
import { getPlatformEmbedURL } from "@liexp/shared/lib/helpers/media";
import { AdminCreate } from "@liexp/shared/lib/io/http/User";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { HumanReadableStringArb } from "@liexp/shared/lib/tests/arbitrary/HumanReadableString.arbitrary";
import { URLArb } from "@liexp/shared/lib/tests/arbitrary/URL.arbitrary";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { fc } from "@liexp/test";
import { pipe } from "fp-ts/function";
import type TelegramBot from "node-telegram-bot-api";
import { Equal } from "typeorm";
import puppeteerMocks from "../../../../__mocks__/puppeteer.mock";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import {
  TGMessageArb,
  TGPhotoArb,
} from "../../../../test/arbitraries/TGMessage.arb";
import { saveUser, type UserTest } from "../../../../test/user.utils";
import { createFromTGMessage } from "../createFromTGMessage.flow";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { UserEntity } from "@entities/User.entity";

const tempDir = path.resolve(__dirname, `../../../../temp/tg/media`);

interface MessageTest {
  n: number;
  urls: (m: TelegramBot.Message) => any[];
  platformVideos?: (m: TelegramBot.Message) => any[];
  photos?: (m: TelegramBot.Message) => any[];
  videos?: (m: TelegramBot.Message) => any[];
}

describe("Create From TG Message", () => {
  let Test: AppTest;
  let admin: UserTest;

  beforeAll(async () => {
    Test = await GetAppTest();
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    admin = await saveUser(Test, [AdminCreate.value]);
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(UserEntity, [admin.id]));
    await Test.utils.e2eAfterAll();
    fs.rmSync(tempDir, { recursive: true });
  });

  describe("createEventSuggestion", () => {
    test(
      "succeeds when link is not yet present in db",
      async () => {
        const url = fc.sample(URLArb, 1)[0];
        const description = fc.sample(HumanReadableStringArb(), 1)[0];

        Test.mocks.puppeteer.page.goto.mockReset().mockResolvedValueOnce({});

        Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce({
          url,
          description,
        });

        Test.mocks.puppeteer.page.emulate.mockReset().mockResolvedValueOnce({});
        Test.mocks.puppeteer.page.$$.mockReset().mockResolvedValueOnce([]);
        Test.mocks.puppeteer.page.screenshot.mockResolvedValueOnce(
          Buffer.from(""),
        );
        Test.mocks.s3.classes.Upload.mockReset().mockImplementation(() => ({
          done: vi.fn().mockResolvedValueOnce({
            Location: fc.sample(fc.webUrl({ size: "small" }), 1)[0],
          }),
        }));
        Test.mocks.puppeteer.browser.close.mockResolvedValueOnce({});

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
            {},
          ),
          throwTE,
        );

        const { id, ...expectedExcerpt } = createExcerptValue(description);
        expectedExcerpt.rows = expectedExcerpt.rows.map(
          ({ id, ...r }) => r,
        ) as any[];

        const expectedLink = await throwTE(
          Test.ctx.db.findOneOrFail(LinkEntity, {
            where: { url: sanitizeURL(url) },
          }),
        );

        expect(result).toMatchObject({
          link: [{ id: expectedLink.id, description }],
          photos: [],
          videos: [],
        });

        await throwTE(Test.ctx.db.delete(LinkEntity, [expectedLink.id]));
        await throwTE(Test.ctx.db.delete(EventSuggestionEntity, [result.id]));
      },
      { timeout: 10_000 },
    );

    test(
      "succeeds when link is already present in db",
      async () => {
        const url = fc.sample(URLArb, 1)[0];
        const description = fc.sample(HumanReadableStringArb(), 1)[0];
        let link = {
          url: sanitizeURL(url),
          description,
          id: uuid(),
        };

        [link] = await throwTE(Test.ctx.db.save(LinkEntity, [link]));

        Test.mocks.puppeteer.page.goto.mockReset().mockResolvedValueOnce({});

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
            {},
          ),
        );

        await throwTE(Test.ctx.db.delete(LinkEntity, [link.id]));

        expect(result).toMatchObject({
          link: [
            {
              id: link.id,
            },
          ],
        });
      },
      { timeout: 10_000 },
    );

    test("succeeds with a photo", async () => {
      const title = fc.sample(HumanReadableStringArb(), 1)[0];

      const [message] = fc.sample(TGMessageArb, 1).map((m) => ({
        ...m,
        photo: fc.sample(TGPhotoArb, 1),
        caption: title,
        caption_entities: [],
      }));

      // // create the media

      const tempFileLocation = path.resolve(
        tempDir,
        `${message.message_id}.png`,
      );
      fs.writeFileSync(tempFileLocation, new Uint8Array(10));

      // mock tg download
      Test.mocks.tg.api.getFileStream.mockImplementationOnce(() =>
        fs.createReadStream(tempFileLocation),
      );

      // mock puppeteer goto
      Test.mocks.puppeteer.page.goto.mockReset().mockResolvedValueOnce({});

      // mock s3 upload
      Test.mocks.s3.client.send.mockImplementationOnce(() =>
        Promise.resolve({
          Key: fc.sample(fc.string(), 1)[0],
          Location: fc.sample(fc.webUrl(), 1)[0],
        }),
      );

      const result = await throwTE(createFromTGMessage(Test.ctx)(message, {}));

      const { id, ...expectedExcerpt } = createExcerptValue(message.caption);
      expectedExcerpt.rows = expectedExcerpt.rows.map(
        ({ id, ...r }) => r,
      ) as any[];

      const { creator, areas, keywords, stories, socialPosts, ...media } =
        await throwTE(
          Test.ctx.db.findOneOrFail(MediaEntity, {
            where: { description: Equal(message.caption) },
          }),
        );

      if (result.link.length > 0) {
        await throwTE(
          Test.ctx.db.delete(LinkEntity, result.link?.map((l) => l.id)),
        );
      }

      await throwTE(
        Test.ctx.db.delete(MediaEntity, [
          ...result.photos.map((m) => m.id),
          ...result.videos.map((m) => m.id),
        ]),
      );

      Test.ctx.logger.debug.log("Result %O", result);

      expect(result).toMatchObject({
        link: [],
        photos: [
          {
            ...media,
            featuredIn: [],
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
        urls: () => [],
        platformVideos(m) {
          const description = fc.sample(fc.string(), 1)[0];
          const thumbnail = fc.sample(fc.webUrl(), 1)[0];
          puppeteerMocks.page.$eval
            .mockReset()
            .mockResolvedValueOnce(description)
            .mockResolvedValueOnce(thumbnail);
          const ytURLChunks = m.caption_entities?.[1].url?.split("/") ?? [];

          return [
            {
              description,
              thumbnail,
              location: getPlatformEmbedURL(
                {
                  platform: "youtube",
                  id: ytURLChunks[ytURLChunks?.length - 1],
                },
                m.caption_entities?.[1].url as any,
              ),
            },
          ];
        },
        videos(m) {
          return [];
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
          return [];
        },
        platformVideos: (m) => {
          const description = fc.sample(fc.string(), 1)[0];
          const thumbnail = fc.sample(fc.webUrl(), 1)[0];
          puppeteerMocks.page.$eval
            .mockReset()
            .mockResolvedValueOnce(description)
            .mockResolvedValueOnce(thumbnail);
          const ytURLChunks = m.caption_entities?.[1].url?.split("/") ?? [];

          return [
            {
              description,
              thumbnail,
              location: getPlatformEmbedURL(
                {
                  platform: "youtube",
                  id: ytURLChunks[ytURLChunks?.length - 1],
                },
                m.caption_entities?.[1].url as any,
              ),
            },
          ];
        },
        videos(m) {
          return [];
        },
      },
      {
        n: 98,
        urls(m) {
          return [
            {
              url: m.caption?.slice(
                m.caption_entities?.[0].offset,
                m.caption_entities?.[0].length,
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
          return [];
        },
        platformVideos: (m) => {
          const description = fc.sample(fc.string(), 1)[0];
          const thumbnail = fc.sample(fc.webUrl(), 1)[0];
          puppeteerMocks.page.$eval
            .mockReset()
            .mockResolvedValueOnce(description)
            .mockResolvedValueOnce(thumbnail);
          const ytURLChunks = m.caption_entities?.[1].url?.split("/") ?? [];

          return [
            {
              description,
              thumbnail,
              location: getPlatformEmbedURL(
                {
                  platform: "youtube",
                  id: ytURLChunks[ytURLChunks?.length - 1],
                },
                m.caption_entities?.[1].url as any,
              ),
            },
          ];
        },
        videos: (m) => {
          return [];
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
                m.caption_entities?.[0].length,
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
      {
        n: 431,
        urls: (m) => {
          return [
            {
              url: m.caption_entities?.[2].url,
            },
            {
              url: m.caption_entities?.[5].url,
            },
            {
              url: m.caption_entities?.[6].url,
            },
          ];
        },
        platformVideos: (m) => {
          const rumbleState = {
            description: "rumble description",
            embedUrl: "url to embed",
            thumbnailUrl: "rumble thumbnail",
          };

          puppeteerMocks.page.$eval
            .mockReset()
            .mockResolvedValueOnce(rumbleState)
            .mockResolvedValueOnce(rumbleState)
            .mockResolvedValueOnce(rumbleState);

          return [
            {
              description: rumbleState.description,
              location: rumbleState.embedUrl,
              thumbnail: rumbleState.thumbnailUrl,
            },
          ];
        },
      },
      {
        n: 861,
        urls: (m) => {
          return [{ url: m.text }];
        },
      },
      {
        n: 863,
        urls: (m) => {
          return [{ url: m.text }];
        },
      },
      {
        n: 865,
        urls: (m) => {
          return [
            {
              url: m.text?.slice(
                m.entities?.[1].offset,
                m.entities?.[1].length,
              ),
            },
          ];
        },
      },
    ];

    // messageCases = messageCases.filter((n: MessageTest) => [865].includes(n.n));

    test.skip.each(messageCases)(
      "Running message case $n",
      async (c: MessageTest) => {
        const message = pipe(
          fs.readFileSync(
            path.resolve(__dirname, `../../../../temp/tg/messages/${c.n}.json`),
            "utf-8",
          ),
          JSON.parse,
        );

        Test.ctx.logger.debug.log("Message %O", message);

        puppeteerMocks.page.emulate.mockReset().mockResolvedValueOnce({});
        const urls = c.urls(message);
        urls.forEach((m) => {
          Test.mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce(m);
        });

        puppeteerMocks.page.goto.mockReset().mockResolvedValue({});
        puppeteerMocks.page.waitForSelector
          .mockReset()
          .mockResolvedValueOnce({});

        const platformVideos = c.platformVideos?.(message) ?? [];
        const photos = c.photos?.(message) ?? [];
        const videos = c.videos?.(message) ?? [];

        Test.ctx.logger.debug.log(
          "Photos and videos %d",
          photos.length + videos.length,
        );
        Test.mocks.tg.api.getFileStream.mockReset();
        Test.mocks.s3.client.send.mockReset();

        // // create the media

        photos.forEach((p) => {
          Test.ctx.logger.debug.log("Mock photo upload %O", p);
          const tempFileLocation = path.resolve(
            tempDir,
            `${message.message_id}.png`,
          );

          fs.writeFileSync(tempFileLocation, new Uint8Array(10));

          // mock tg download
          Test.mocks.tg.api.getFileStream.mockImplementationOnce(() =>
            fs.createReadStream(tempFileLocation),
          );

          // mock s3 upload
          Test.mocks.s3.client.send.mockImplementationOnce(() =>
            Promise.resolve({
              Key: fc.sample(fc.string(), 1)[0],
              Location: fc.sample(fc.webUrl(), 1)[0],
            }),
          );
        });

        videos.forEach((p) => {
          Test.ctx.logger.debug.log("Mock video upload %O", p);
          const tempFileLocation = path.resolve(
            tempDir,
            `${message.message_id}.png`,
          );

          fs.writeFileSync(tempFileLocation, new Uint8Array(10));

          // mock tg download
          Test.mocks.tg.api.getFileStream
            .mockImplementationOnce(() => fs.createReadStream(tempFileLocation))
            .mockImplementationOnce(() =>
              fs.createReadStream(tempFileLocation),
            );

          // mock s3 upload
          Test.mocks.s3.client.send
            .mockImplementationOnce((args) => {
              Test.ctx.logger.debug.log("Upload %O", args);
              return Promise.resolve({
                Key: fc.sample(fc.string(), 1)[0],
                Location: fc.sample(
                  fc
                    .string({ minLength: 10, maxLength: 12 })
                    .map((id) => `https://youtube.com/watch?v=${id}`),
                  1,
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
                  1,
                )[0],
              }),
            );
        });

        const result = await throwTE(
          createFromTGMessage(Test.ctx)(message, {}),
        );

        expect(result.link).toMatchObject(
          urls.map((url) => ({
            ...url,
            description: url.description ?? null,
          })),
        );
        expect(result.photos).toMatchObject(photos);
        expect(result.videos).toMatchObject([...videos, ...platformVideos]);

        if (result.link.length > 0) {
          await throwTE(
            Test.ctx.db.delete(
              LinkEntity,
              result.link.map((p) => p.id),
            ),
          );
        }

        if (result.photos.length > 0 || result.videos.length > 0) {
          await throwTE(
            Test.ctx.db.delete(MediaEntity, [
              ...result.photos.map((p) => p.id),
              ...result.videos.map((v) => v.id),
            ]),
          );
        }
      },
    );
  });
});
