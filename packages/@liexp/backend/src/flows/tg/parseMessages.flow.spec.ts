import { fp, pipe } from "@liexp/core/lib/fp/index.js";
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
import { mockedContext } from "../../test/context.js";
import { createFromTGMessage } from "./createFromTGMessage.flow.js";
import { parseTGMessageFileFlow } from "./parseMessages.flow.js";

// Mock createFromTGMessage which has deep database/network dependencies
vi.mock("./createFromTGMessage.flow.js", () => ({
  createFromTGMessage: vi.fn(),
}));

type TestContext = TGBotProviderContext &
  LoggerContext &
  FSClientContext &
  DatabaseContext &
  PuppeteerProviderContext &
  HTTPProviderContext &
  ImgProcClientContext &
  SpaceContext &
  ENVContext &
  URLMetadataContext &
  QueuesProviderContext &
  ConfigContext &
  FFMPEGProviderContext &
  RedisContext;

describe(parseTGMessageFileFlow.name, () => {
  const appTest = {
    ctx: {
      ...mockedContext<TestContext>({
        tgBot: mock(),
        db: mock(),
        puppeteer: mock(),
        http: mock(),
        imgProc: mock(),
        space: mock(),
        urlMetadata: mock(),
        queues: mock(),
        ffmpeg: mock(),
        redis: mock(),
        fs: mock(),
      }),
      env: { DEFAULT_PAGE_SIZE: 20 } as any,
    },
  };

  const filePath = "/tmp/tg-messages/message-001.json";

  const mockEventResult = {
    link: [],
    photos: [],
    videos: [],
    areas: [],
    hashtags: [],
  };

  const mockMessage = { message_id: 1, text: "Hello world", date: 1234567890 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should read a file, parse the JSON message, and return EventResult", async () => {
    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.right(JSON.stringify(mockMessage)),
    );

    vi.mocked(createFromTGMessage).mockReturnValue(() =>
      fp.TE.right(mockEventResult),
    );

    const result = await pipe(
      parseTGMessageFileFlow(filePath, false)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.fs.getObject).toHaveBeenCalledWith(filePath);
    expect(createFromTGMessage).toHaveBeenCalledWith(mockMessage, {
      type: "text",
    });
    expect(result).toEqual(mockEventResult);
  });

  it("should NOT delete the file when deleteFile is false", async () => {
    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.right(JSON.stringify(mockMessage)),
    );

    vi.mocked(createFromTGMessage).mockReturnValue(() =>
      fp.TE.right(mockEventResult),
    );

    await pipe(parseTGMessageFileFlow(filePath, false)(appTest.ctx), throwTE);

    expect(appTest.ctx.fs.deleteObject).not.toHaveBeenCalled();
  });

  it("should delete the file after processing when deleteFile is true", async () => {
    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.right(JSON.stringify(mockMessage)),
    );

    vi.mocked(createFromTGMessage).mockReturnValue(() =>
      fp.TE.right(mockEventResult),
    );

    appTest.ctx.fs.deleteObject.mockReturnValueOnce(fp.TE.right(undefined));

    await pipe(parseTGMessageFileFlow(filePath, true)(appTest.ctx), throwTE);

    expect(appTest.ctx.fs.deleteObject).toHaveBeenCalledWith(filePath);
  });

  it("should return Left when fs.getObject fails", async () => {
    const fsError = { name: "FSError", message: "file not found" };

    appTest.ctx.fs.getObject.mockReturnValueOnce(fp.TE.left(fsError as any));

    const te = parseTGMessageFileFlow(filePath, false)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(createFromTGMessage).not.toHaveBeenCalled();
  });

  it("should return Left (TGError) when createFromTGMessage fails", async () => {
    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.right(JSON.stringify(mockMessage)),
    );

    const parseError = new Error("parse failed");
    vi.mocked(createFromTGMessage).mockReturnValue(() =>
      fp.TE.left(parseError as any),
    );

    const te = parseTGMessageFileFlow(filePath, false)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    // error is wrapped via toTGError
    expect((outcome as any).left.name).toBe("TGError");
  });

  it("should return Left when deleteFile is true but fs.deleteObject fails", async () => {
    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.right(JSON.stringify(mockMessage)),
    );

    vi.mocked(createFromTGMessage).mockReturnValue(() =>
      fp.TE.right(mockEventResult),
    );

    const deleteError = { name: "FSError", message: "cannot delete" };
    appTest.ctx.fs.deleteObject.mockReturnValueOnce(
      fp.TE.left(deleteError as any),
    );

    const te = parseTGMessageFileFlow(filePath, true)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(appTest.ctx.fs.deleteObject).toHaveBeenCalledWith(filePath);
  });

  it("should handle complex message JSON with nested structure", async () => {
    const complexMessage = {
      message_id: 42,
      text: "#breaking news https://example.com",
      date: 1700000000,
      entities: [{ type: "hashtag", offset: 0, length: 9 }],
    };

    const complexResult = {
      ...mockEventResult,
      hashtags: ["#breaking"],
    };

    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.right(JSON.stringify(complexMessage)),
    );

    vi.mocked(createFromTGMessage).mockReturnValue(() =>
      fp.TE.right(complexResult),
    );

    const result = await pipe(
      parseTGMessageFileFlow(filePath, false)(appTest.ctx),
      throwTE,
    );

    expect(createFromTGMessage).toHaveBeenCalledWith(complexMessage, {
      type: "text",
    });
    expect(result.hashtags).toEqual(["#breaking"]);
  });
});
