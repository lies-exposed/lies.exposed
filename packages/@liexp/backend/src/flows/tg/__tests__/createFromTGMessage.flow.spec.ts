import * as fs from "fs";
import path from "path";
import { GetLogger } from "@liexp/core";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getPlatformEmbedURL } from "@liexp/shared/lib/helpers/media.helper.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { HumanReadableStringArb } from "@liexp/shared/lib/tests/arbitrary/HumanReadableString.arbitrary.js";
import { URLArb } from "@liexp/shared/lib/tests/arbitrary/URL.arbitrary.js";
import { UserArb } from "@liexp/shared/lib/tests/arbitrary/User.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { fc } from "@liexp/test";
import debug from "debug";
import type TelegramBot from "node-telegram-bot-api";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { GetFSClient } from "../../../providers/fs/fs.provider.js";
import { GetDatabaseClient } from "../../../providers/orm/database.provider.js";
import { GetPuppeteerProvider } from "../../../providers/puppeteer.provider.js";
import { EventsConfig } from "../../../queries/config/index.js";
import {
  TGMessageArb,
  TGPhotoArb,
} from "../../../test/arbitraries/TGMessage.arb.js";
import puppeteerMocks from "../../../test/mocks/puppeteer.mock.js";
import { mocks } from "../../../test/mocks.js";
import { type UserTest } from "../../../test/user.utils.js";
import { createFromTGMessage } from "../createFromTGMessage.flow.js";

const tempDir = path.resolve(__dirname, `../../../../temp/tg/media`);

debug.enable("*");

interface MessageTest {
  n: number;
  urls: (m: TelegramBot.Message) => any[];
  platformVideos?: (m: TelegramBot.Message) => any[];
  photos?: (m: TelegramBot.Message) => any[];
  videos?: (m: TelegramBot.Message) => any[];
}

describe("Create From TG Message", () => {
  let admin: UserTest;
  const ctx = {
    db: GetDatabaseClient({
      ...mocks.db,
      logger: GetLogger("test"),
    }),
    tg: mocks.tg,
    http: HTTPProvider(mocks.axios as any),
    logger: GetLogger("test"),
    imgProc: {} as any,
    s3: mocks.s3 as any,
    env: {} as any,
    urlMetadata: mocks.urlMetadata,
    queue: mocks.queueFS as any,
    config: { events: EventsConfig } as any,
    fs: GetFSClient(),
    ffmpeg: {} as any,
    pdf: PDFProvider({ client: mocks.pdf }),
    puppeteer: GetPuppeteerProvider(mocks.puppeteer, {}, {} as any),
  };

  beforeAll(() => {
    [admin] = fc.sample(UserArb, 1).map((u) => ({
      ...u,
      password: "password",
      permissions: [AdminCreate.value],
    }));
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // admin = await saveUser(ctx, [AdminCreate.value]);
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true });
  });

  describe.skip("createEventSuggestion", () => {
    test(
      "succeeds when link is not yet present in db",
      { timeout: 10_000 },
      async () => {
        const url = fc.sample(URLArb, 1)[0];
        const description = fc.sample(HumanReadableStringArb(), 1)[0];
        mocks.db.connection.manager.findOne.mockResolvedValue(null);

        mocks.db.qb.getOneOrFail.mockResolvedValue(admin);

        mocks.db.connection.manager.save.mockImplementationOnce((ss) =>
          Promise.resolve(ss),
        );

        mocks.puppeteer.page.goto.mockReset().mockResolvedValueOnce({});

        mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce({
          url,
          description,
        });

        mocks.puppeteer.page.emulate.mockReset().mockResolvedValueOnce({});
        mocks.puppeteer.page.$$.mockReset().mockResolvedValueOnce([]);
        mocks.puppeteer.page.screenshot.mockResolvedValueOnce(Buffer.from(""));
        mocks.s3.classes.Upload.mockReset().mockImplementation(() => ({
          done: vi.fn().mockResolvedValueOnce({
            Location: fc.sample(fc.webUrl({ size: "small" }), 1)[0],
          }),
        }));
        mocks.queueFS.writeObject.mockImplementation(() =>
          fp.TE.right(undefined),
        );

        mocks.puppeteer.browser.close.mockResolvedValueOnce({});

        const result: any = await pipe(
          createFromTGMessage(
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
          )(ctx),
          throwTE,
        );

        // const expectedLink = await throwTE(
        //   ctx.db.findOneOrFail(LinkEntity, {
        //     where: { url: sanitizeURL(url) },
        //   }),
        // );

        expect(result).toMatchObject({
          link: [expect.any(String)],
          photos: [],
          videos: [],
        });

        expect(mocks.db.connection.manager.save).toHaveBeenCalledTimes(1);
      },
    );

    test(
      "succeeds when link is already present in db",
      { timeout: 10_000 },
      async () => {
        const url = fc.sample(URLArb, 1)[0];
        const description = fc.sample(HumanReadableStringArb(), 1)[0];
        const linkData = {
          url: sanitizeURL(url),
          description,
          id: uuid(),
        };

        mocks.db.connection.manager.findOneOrFail.mockResolvedValueOnce(
          linkData,
        );

        mocks.puppeteer.page.goto.mockReset().mockResolvedValueOnce({});

        const result = await throwTE(
          createFromTGMessage(
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
          )(ctx),
        );

        expect(result).toMatchObject({
          link: expect.any(Array),
        });
      },
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
      mocks.tg.getFileStream.mockImplementationOnce(() =>
        fp.TE.right(fs.createReadStream(tempFileLocation)),
      );

      // mock puppeteer goto
      mocks.puppeteer.page.goto.mockReset().mockResolvedValueOnce({});

      // mock s3 upload
      mocks.s3.client.send.mockImplementationOnce(() =>
        Promise.resolve({
          Key: fc.sample(fc.string(), 1)[0],
          Location: fc.sample(fc.webUrl(), 1)[0],
        }),
      );

      const result = await throwTE(createFromTGMessage(message, {})(ctx));

      expect(result).toMatchObject({
        link: [],
        photos: [expect.any(String)],
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

        puppeteerMocks.page.emulate.mockReset().mockResolvedValueOnce({});
        const urls = c.urls(message);
        urls.forEach((m) => {
          mocks.urlMetadata.fetchMetadata.mockResolvedValueOnce(m);
        });

        puppeteerMocks.page.goto.mockReset().mockResolvedValue({});
        puppeteerMocks.page.waitForSelector
          .mockReset()
          .mockResolvedValueOnce({});

        const platformVideos = c.platformVideos?.(message) ?? [];
        const photos = c.photos?.(message) ?? [];
        const videos = c.videos?.(message) ?? [];

        mocks.tg.api.getFileStream.mockReset();
        mocks.s3.client.send.mockReset();

        // // create the media

        photos.forEach((p) => {
          const tempFileLocation = path.resolve(
            tempDir,
            `${message.message_id}.png`,
          );

          fs.writeFileSync(tempFileLocation, new Uint8Array(10));

          // mock tg download
          mocks.tg.api.getFileStream.mockImplementationOnce(() =>
            fs.createReadStream(tempFileLocation),
          );

          // mock s3 upload
          mocks.s3.client.send.mockImplementationOnce(() =>
            Promise.resolve({
              Key: fc.sample(fc.string(), 1)[0],
              Location: fc.sample(fc.webUrl(), 1)[0],
            }),
          );
        });

        videos.forEach((p) => {
          const tempFileLocation = path.resolve(
            tempDir,
            `${message.message_id}.png`,
          );

          fs.writeFileSync(tempFileLocation, new Uint8Array(10));

          // mock tg download
          mocks.tg.api.getFileStream
            .mockImplementationOnce(() => fs.createReadStream(tempFileLocation))
            .mockImplementationOnce(() =>
              fs.createReadStream(tempFileLocation),
            );

          // mock s3 upload
          mocks.s3.client.send
            .mockImplementationOnce((args: any) => {
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

        const result = await throwTE(createFromTGMessage(message, {})(ctx));

        expect(result.link).toMatchObject(
          urls.map((url) => ({
            ...url,
            description: url.description ?? null,
          })),
        );
        expect(result.photos).toMatchObject(photos);
        expect(result.videos).toMatchObject([...videos, ...platformVideos]);
      },
    );
  });
});
