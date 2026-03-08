import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import {
  type ImgProcClientContext,
  type TGBotProviderContext,
} from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type RedisContext } from "../../context/redis.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { getOneAdminOrFail } from "../user/getOneUserOrFail.flow.js";
import { MessageParser } from "./MessageParser/index.js";
import { createFromTGMessage } from "./createFromTGMessage.flow.js";

vi.mock("./MessageParser/index.js", () => ({
  MessageParser: vi.fn(),
}));

vi.mock("../user/getOneUserOrFail.flow.js", () => ({
  getOneAdminOrFail: vi.fn(),
}));

type TestContext = LoggerContext &
  DatabaseContext &
  PuppeteerProviderContext &
  TGBotProviderContext &
  HTTPProviderContext &
  ImgProcClientContext &
  SpaceContext &
  ENVContext &
  URLMetadataContext &
  QueuesProviderContext &
  ConfigContext &
  FSClientContext &
  FFMPEGProviderContext &
  RedisContext;

describe(createFromTGMessage.name, () => {
  const appTest = {
    ctx: mockedContext<TestContext>({
      db: mock(),
      puppeteer: mock(),
      tg: mock(),
      http: mock(),
      imgProc: mock(),
      space: mock(),
      urlMetadata: mock(),
      queues: mock(),
      fs: mock(),
      ffmpeg: mock(),
      redis: mock(),
      s3: mock(),
    }),
  };

  const mockMetadata = { type: "text" } as any;

  const adminUser = Object.assign(new UserEntity(), {
    id: uuid(),
    username: "admin",
  });

  const mockPage = {
    browser: vi
      .fn()
      .mockReturnValue({ close: vi.fn().mockResolvedValue(undefined) }),
  } as any;

  const _mockParserResult = {
    link: [],
    photos: [],
    videos: [],
    areas: [],
    hashtags: [],
    documents: [],
    pdfMedia: [],
    platformMedia: [],
  };

  const makeParser = (overrides?: Partial<typeof _mockParserResult>) => ({
    parseDocument: () => fp.TE.right([]),
    parsePhoto: () => fp.TE.right([]),
    parseVideo: () => fp.TE.right([]),
    parseURLs: () => () => fp.TE.right([]),
    parsePDFURLs: () => () => fp.TE.right([]),
    parsePlatformMedia: () => () => fp.TE.right([]),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create event result from a basic text message", async () => {
    const message = {
      message_id: 1,
      text: "Hello world",
      date: 1234567890,
      entities: [],
    } as any;

    vi.mocked(getOneAdminOrFail).mockReturnValue(fp.TE.right(adminUser));

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    vi.mocked(MessageParser).mockReturnValue(makeParser() as any);

    const result = await pipe(
      createFromTGMessage(message, mockMetadata)(appTest.ctx),
      throwTE,
    );

    expect(result).toMatchObject({
      link: [],
      photos: [],
      videos: [],
      areas: [],
      hashtags: [],
    });
    expect(getOneAdminOrFail).toHaveBeenCalledWith(appTest.ctx);
    expect(MessageParser).toHaveBeenCalledWith(message);
  });

  it("should extract hashtags from message entities", async () => {
    const message = {
      message_id: 2,
      text: "#breaking news today",
      date: 1234567890,
      entities: [{ type: "hashtag", offset: 0, length: 9 }],
    } as any;

    vi.mocked(getOneAdminOrFail).mockReturnValue(fp.TE.right(adminUser));

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    vi.mocked(MessageParser).mockReturnValue(makeParser() as any);

    const result = await pipe(
      createFromTGMessage(message, mockMetadata)(appTest.ctx),
      throwTE,
    );

    expect(result.hashtags).toEqual(["#breaking"]);
  });

  it("should merge platformMedia into videos and pdfMedia into photos", async () => {
    const mediaId1 = uuid();
    const mediaId2 = uuid();
    const pdfId = uuid();
    const platformId = uuid();

    const message = {
      message_id: 3,
      text: "test",
      date: 1234567890,
      entities: [],
    } as any;

    vi.mocked(getOneAdminOrFail).mockReturnValue(fp.TE.right(adminUser));

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    vi.mocked(MessageParser).mockReturnValue(
      makeParser({
        parsePhoto: () => fp.TE.right([mediaId1]),
        parseVideo: () => fp.TE.right([mediaId2]),
        parsePDFURLs: () => () => fp.TE.right([pdfId]),
        parsePlatformMedia: () => () => fp.TE.right([platformId]),
      }) as any,
    );

    const result = await pipe(
      createFromTGMessage(message, mockMetadata)(appTest.ctx),
      throwTE,
    );

    // pdfMedia is merged into photos
    expect(result.photos).toContain(mediaId1);
    expect(result.photos).toContain(pdfId);
    // platformMedia is merged into videos
    expect(result.videos).toContain(mediaId2);
    expect(result.videos).toContain(platformId);
  });

  it("should handle message with no entities gracefully", async () => {
    const message = {
      message_id: 4,
      text: "no entities here",
      date: 1234567890,
      // entities is undefined
    } as any;

    vi.mocked(getOneAdminOrFail).mockReturnValue(fp.TE.right(adminUser));

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    vi.mocked(MessageParser).mockReturnValue(makeParser() as any);

    const result = await pipe(
      createFromTGMessage(message, mockMetadata)(appTest.ctx),
      throwTE,
    );

    expect(result.hashtags).toEqual([]);
  });

  it("should return Left when getOneAdminOrFail fails", async () => {
    const message = {
      message_id: 5,
      text: "test",
      date: 1234567890,
      entities: [],
    } as any;

    vi.mocked(getOneAdminOrFail).mockReturnValue(
      fp.TE.left({ name: "DBError", message: "no admin found" } as any),
    );

    const te = createFromTGMessage(message, mockMetadata)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(appTest.ctx.puppeteer.getBrowserFirstPage).not.toHaveBeenCalled();
  });

  it("should return Left when getBrowserFirstPage fails", async () => {
    const message = {
      message_id: 6,
      text: "test",
      date: 1234567890,
      entities: [],
    } as any;

    vi.mocked(getOneAdminOrFail).mockReturnValue(fp.TE.right(adminUser));

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.left(new Error("browser error")),
    );

    const te = createFromTGMessage(message, mockMetadata)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
  });

  it("should close browser page even when parsing fails (bracket cleanup)", async () => {
    const closeFn = vi.fn().mockResolvedValue(undefined);
    const pageWithClose = {
      ...mockPage,
      browser: vi.fn().mockReturnValue({ close: closeFn }),
    };

    const message = {
      message_id: 7,
      text: "test",
      date: 1234567890,
      entities: [],
    } as any;

    vi.mocked(getOneAdminOrFail).mockReturnValue(fp.TE.right(adminUser));

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(pageWithClose),
    );

    vi.mocked(MessageParser).mockReturnValue(
      makeParser({
        parseURLs: () => () =>
          fp.TE.left({ name: "TGError", message: "parse error" } as any),
      }) as any,
    );

    const te = createFromTGMessage(message, mockMetadata)(appTest.ctx);
    const outcome = await te();

    // Browser should be closed even on error
    expect(closeFn).toHaveBeenCalled();
    expect(outcome._tag).toBe("Left");
  });
});
