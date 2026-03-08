import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "fp-ts/lib/Option.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type ConfigContext } from "../../../context/config.context.js";
import { type DatabaseContext } from "../../../context/db.context.js";
import { type ENVContext } from "../../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import {
  type ImgProcClientContext,
  type TGBotProviderContext,
} from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../../context/queue.context.js";
import { type RedisContext } from "../../../context/redis.context.js";
import { type SpaceContext } from "../../../context/space.context.js";
import { type URLMetadataContext } from "../../../context/urlMetadata.context.js";
import { UserEntity } from "../../../entities/User.entity.js";
import { mockedContext } from "../../../test/context.js";

// Mock sub-parser flows so they don't need real dependencies
vi.mock("../parseDocument.flow.js", () => ({
  parseDocument: vi.fn(),
}));

vi.mock("../parsePhoto.flow.js", () => ({
  parsePhoto: vi.fn(),
}));

vi.mock("../parseVideo.flow.js", () => ({
  parseVideo: vi.fn(),
}));

vi.mock("../parseURL.flow.js", () => ({
  parseURLs: vi.fn(),
}));

vi.mock("../parsePDFURL.flow.js", () => ({
  parsePDFURLs: vi.fn(),
}));

vi.mock("../parsePlatformMedia.flow.js", () => ({
  parsePlatformMedia: vi.fn(),
}));

import { parseDocument } from "../parseDocument.flow.js";
import { parsePhoto } from "../parsePhoto.flow.js";
import { parseVideo } from "../parseVideo.flow.js";
import { parseURLs } from "../parseURL.flow.js";
import { parsePDFURLs } from "../parsePDFURL.flow.js";
import { parsePlatformMedia } from "../parsePlatformMedia.flow.js";
import { MessageParser } from "./index.js";

type MessageParserContext = DatabaseContext &
  TGBotProviderContext &
  LoggerContext &
  SpaceContext &
  ENVContext &
  URLMetadataContext &
  QueuesProviderContext &
  ConfigContext &
  FSClientContext &
  HTTPProviderContext &
  RedisContext &
  PuppeteerProviderContext &
  FFMPEGProviderContext &
  ImgProcClientContext;

describe("MessageParser", () => {
  const appTest = {
    ctx: mockedContext<MessageParserContext>({
      tg: mock(),
      db: mock(),
      space: mock(),
      urlMetadata: mock(),
      queues: mock(),
      fs: mock(),
      http: mock(),
      redis: mock(),
      puppeteer: mock(),
      ffmpeg: mock(),
      imgProc: mock(),
      s3: mock(),
    }),
  };

  const mockPage = {} as any;
  const testUser = Object.assign(new UserEntity(), { id: uuid() });

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default implementations so mocks return valid RTEs
    vi.mocked(parseDocument).mockReturnValue(() => fp.TE.right([]));
    vi.mocked(parsePhoto).mockReturnValue(() => fp.TE.right([]));
    vi.mocked(parseVideo).mockReturnValue(() => fp.TE.right([]));
    vi.mocked(parseURLs).mockImplementation(() => () => fp.TE.right([]));
    vi.mocked(parsePDFURLs).mockReturnValue(() => fp.TE.right([]));
    vi.mocked(parsePlatformMedia).mockReturnValue(() => fp.TE.right([]));
  });

  describe("parseDocument", () => {
    it("should return empty array when message has no document", async () => {
      const message = {
        message_id: 1,
        text: "no document",
        date: 123,
      } as any;

      const parser = MessageParser(message);

      const result = await pipe(parser.parseDocument(appTest.ctx), throwTE);

      expect(result).toEqual([]);
      expect(parseDocument).not.toHaveBeenCalled();
    });

    it("should call parseDocument flow when message has a document", async () => {
      const docId = uuid();
      const document = {
        file_id: "doc-123",
        file_unique_id: "doc-unique",
        file_name: "test.pdf",
        mime_type: "application/pdf",
      };

      const message = {
        message_id: 1,
        date: 123,
        document,
      } as any;

      vi.mocked(parseDocument).mockReturnValue(() =>
        fp.TE.right([docId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(parser.parseDocument(appTest.ctx), throwTE);

      expect(parseDocument).toHaveBeenCalledWith(document);
      expect(result).toEqual([docId]);
    });
  });

  describe("parsePhoto", () => {
    it("should return empty array when message has no photos", async () => {
      const message = {
        message_id: 1,
        text: "no photos",
        date: 123,
        photo: [],
      } as any;

      const parser = MessageParser(message);
      const result = await pipe(parser.parsePhoto(appTest.ctx), throwTE);

      expect(result).toEqual([]);
    });

    it("should call parsePhoto flow for photos with width > 1000", async () => {
      const photoId = uuid();
      const photo = [
        {
          file_id: "photo-small",
          file_unique_id: "small-unique",
          width: 320,
          height: 240,
        },
        {
          file_id: "photo-large",
          file_unique_id: "large-unique",
          width: 1920,
          height: 1080,
        },
      ];

      const message = {
        message_id: 1,
        date: 123,
        caption: "Test caption",
        photo,
      } as any;

      vi.mocked(parsePhoto).mockReturnValue(() =>
        fp.TE.right([photoId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(parser.parsePhoto(appTest.ctx), throwTE);

      // parsePhoto should be called with only the large photo
      expect(parsePhoto).toHaveBeenCalledWith(
        "Test caption",
        expect.arrayContaining([
          expect.objectContaining({ file_id: "photo-large" }),
        ]),
      );
      expect(result).toEqual([photoId]);
    });

    it("should deduplicate photos with same file_id", async () => {
      const photo = [
        {
          file_id: "same-id",
          file_unique_id: "same-unique",
          width: 1920,
          height: 1080,
        },
        {
          file_id: "same-id",
          file_unique_id: "same-unique-2",
          width: 1920,
          height: 1080,
        },
      ];

      const message = {
        message_id: 1,
        date: 123,
        photo,
      } as any;

      vi.mocked(parsePhoto).mockReturnValue(() =>
        fp.TE.right([uuid()]),
      );

      const parser = MessageParser(message);
      await pipe(parser.parsePhoto(appTest.ctx), throwTE);

      // Should only pass one photo (deduplicated by file_id)
      expect(parsePhoto).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ file_id: "same-id" }),
        ]),
      );
      const calledWith = vi.mocked(parsePhoto).mock.calls[0][1];
      expect(calledWith).toHaveLength(1);
    });

    it("should return empty array and swallow error when parsePhoto fails", async () => {
      const photo = [
        {
          file_id: "photo-big",
          file_unique_id: "big-unique",
          width: 1920,
          height: 1080,
        },
      ];

      const message = {
        message_id: 1,
        date: 123,
        photo,
      } as any;

      vi.mocked(parsePhoto).mockReturnValue(() =>
        fp.TE.left({ name: "ServerError", message: "download failed" } as any),
      );

      const parser = MessageParser(message);
      const result = await pipe(parser.parsePhoto(appTest.ctx), throwTE);

      // Error is swallowed via TE.fold
      expect(result).toEqual([]);
    });
  });

  describe("parseVideo", () => {
    it("should return empty array when message has no video", async () => {
      const message = {
        message_id: 1,
        text: "no video",
        date: 123,
      } as any;

      const parser = MessageParser(message);
      const result = await pipe(parser.parseVideo(appTest.ctx), throwTE);

      expect(result).toEqual([]);
      expect(parseVideo).not.toHaveBeenCalled();
    });

    it("should call parseVideo flow when message has a video", async () => {
      const videoId = uuid();
      const video = {
        file_id: "video-123",
        file_unique_id: "video-unique",
        width: 1280,
        height: 720,
        duration: 60,
      };

      const message = {
        message_id: 1,
        date: 123,
        caption: "My video caption",
        video,
      } as any;

      vi.mocked(parseVideo).mockReturnValue(() =>
        fp.TE.right([videoId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(parser.parseVideo(appTest.ctx), throwTE);

      expect(parseVideo).toHaveBeenCalledWith("My video caption", video);
      expect(result).toEqual([videoId]);
    });

    it("should use file_id as description fallback when no caption", async () => {
      const videoId = uuid();
      const video = {
        file_id: "video-fallback-id",
        file_unique_id: "video-unique-fallback",
        width: 1280,
        height: 720,
        duration: 60,
      };

      const message = {
        message_id: 1,
        date: 123,
        video,
        // No caption or text
      } as any;

      vi.mocked(parseVideo).mockReturnValue(() =>
        fp.TE.right([videoId]),
      );

      const parser = MessageParser(message);
      await pipe(parser.parseVideo(appTest.ctx), throwTE);

      // Should use file_unique_id or file_id as fallback
      expect(parseVideo).toHaveBeenCalledWith(
        expect.stringContaining("video"),
        video,
      );
    });
  });

  describe("parseURLs", () => {
    it("should return empty array when message has no URL entities", async () => {
      const message = {
        message_id: 1,
        text: "plain text no URLs",
        date: 123,
        entities: [],
      } as any;

      vi.mocked(parseURLs).mockImplementation((urls) => () =>
        fp.TE.right([]),
      );

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parseURLs(mockPage, testUser)(appTest.ctx),
        throwTE,
      );

      expect(result).toEqual([]);
      // parseURLs is called with O.none when no URLs
      expect(parseURLs).toHaveBeenCalledWith(O.none, testUser, mockPage);
    });

    it("should extract URL from url-type entity", async () => {
      const linkId = uuid();
      const message = {
        message_id: 1,
        text: "Check https://example.com/article",
        date: 123,
        entities: [{ type: "url", offset: 6, length: 27 }],
      } as any;

      vi.mocked(parseURLs).mockImplementation(() => () =>
        fp.TE.right([linkId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parseURLs(mockPage, testUser)(appTest.ctx),
        throwTE,
      );

      expect(parseURLs).toHaveBeenCalledWith(
        expect.any(Object), // O.some(urls)
        testUser,
        mockPage,
      );
      expect(result).toEqual([linkId]);
    });

    it("should extract URL from text_link entity", async () => {
      const linkId = uuid();
      const message = {
        message_id: 1,
        text: "Click here",
        date: 123,
        entities: [
          {
            type: "text_link",
            offset: 0,
            length: 10,
            url: "https://example.com/linked",
          },
        ],
      } as any;

      vi.mocked(parseURLs).mockImplementation(() => () =>
        fp.TE.right([linkId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parseURLs(mockPage, testUser)(appTest.ctx),
        throwTE,
      );

      expect(parseURLs).toHaveBeenCalledWith(
        O.some(expect.arrayContaining(["https://example.com/linked"])),
        testUser,
        mockPage,
      );
      expect(result).toEqual([linkId]);
    });
  });

  describe("parsePDFURLs", () => {
    it("should return empty array when no PDF URLs in message", async () => {
      const message = {
        message_id: 1,
        text: "no PDF here",
        date: 123,
        entities: [],
      } as any;

      vi.mocked(parsePDFURLs).mockReturnValue(() =>
        fp.TE.right([]),
      );

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parsePDFURLs(testUser)(appTest.ctx),
        throwTE,
      );

      expect(result).toEqual([]);
    });

    it("should extract and parse PDF URL from entities", async () => {
      const pdfId = uuid();
      const message = {
        message_id: 1,
        text: "Download https://example.com/file.pdf",
        date: 123,
        entities: [{ type: "url", offset: 9, length: 28 }],
      } as any;

      vi.mocked(parsePDFURLs).mockReturnValue(() =>
        fp.TE.right([pdfId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parsePDFURLs(testUser)(appTest.ctx),
        throwTE,
      );

      // parsePDFURLs should be called with the pdf URL array
      expect(parsePDFURLs).toHaveBeenCalledWith(
        expect.arrayContaining(["https://example.com/file.pdf"]),
      );
      expect(result).toEqual([pdfId]);
    });
  });

  describe("parsePlatformMedia", () => {
    it("should return empty array when no platform media URLs in message", async () => {
      const message = {
        message_id: 1,
        text: "no video links",
        date: 123,
        entities: [],
      } as any;

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parsePlatformMedia(mockPage, testUser)(appTest.ctx),
        throwTE,
      );

      expect(result).toEqual([]);
      expect(parsePlatformMedia).not.toHaveBeenCalled();
    });

    it("should parse YouTube URL from message entity", async () => {
      const mediaId = uuid();
      const youtubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      const message = {
        message_id: 1,
        text: `Watch this: ${youtubeUrl}`,
        date: 123,
        entities: [{ type: "url", offset: 12, length: youtubeUrl.length }],
      } as any;

      vi.mocked(parsePlatformMedia).mockReturnValue(() =>
        fp.TE.right([mediaId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parsePlatformMedia(mockPage, testUser)(appTest.ctx),
        throwTE,
      );

      expect(parsePlatformMedia).toHaveBeenCalledWith(
        expect.stringContaining("youtube.com"),
        expect.objectContaining({ platform: "youtube" }),
        mockPage,
        testUser,
      );
      expect(result).toEqual([mediaId]);
    });

    it("should process multiple platform media URLs", async () => {
      const mediaId1 = uuid();
      const mediaId2 = uuid();
      const yt1 = "https://www.youtube.com/watch?v=video001";
      const yt2 = "https://www.youtube.com/watch?v=video002";

      const message = {
        message_id: 1,
        text: `Watch ${yt1} and ${yt2}`,
        date: 123,
        entities: [
          { type: "url", offset: 6, length: yt1.length },
          { type: "url", offset: 6 + yt1.length + 5, length: yt2.length },
        ],
      } as any;

      vi.mocked(parsePlatformMedia)
        .mockReturnValueOnce(() => fp.TE.right([mediaId1]))
        .mockReturnValueOnce(() => fp.TE.right([mediaId2]));

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parsePlatformMedia(mockPage, testUser)(appTest.ctx),
        throwTE,
      );

      expect(parsePlatformMedia).toHaveBeenCalledTimes(2);
      expect(result).toEqual([mediaId1, mediaId2]);
    });

    it("should extract platform media from caption_entities", async () => {
      const mediaId = uuid();
      const youtubeUrl = "https://www.youtube.com/watch?v=abc12345";

      const message = {
        message_id: 1,
        date: 123,
        caption: `Video: ${youtubeUrl}`,
        caption_entities: [
          { type: "url", offset: 7, length: youtubeUrl.length },
        ],
      } as any;

      vi.mocked(parsePlatformMedia).mockReturnValue(() =>
        fp.TE.right([mediaId]),
      );

      const parser = MessageParser(message);
      const result = await pipe(
        parser.parsePlatformMedia(mockPage, testUser)(appTest.ctx),
        throwTE,
      );

      expect(parsePlatformMedia).toHaveBeenCalledWith(
        expect.stringContaining("youtube.com"),
        expect.objectContaining({ platform: "youtube" }),
        mockPage,
        testUser,
      );
      expect(result).toEqual([mediaId]);
    });

    it("should return Left when parsePlatformMedia flow fails", async () => {
      const youtubeUrl = "https://www.youtube.com/watch?v=failtest";
      const message = {
        message_id: 1,
        text: `Watch ${youtubeUrl}`,
        date: 123,
        entities: [{ type: "url", offset: 6, length: youtubeUrl.length }],
      } as any;

      vi.mocked(parsePlatformMedia).mockReturnValue(() =>
        fp.TE.left({ name: "ServerError", message: "platform failed" } as any),
      );

      const parser = MessageParser(message);
      const te = parser.parsePlatformMedia(mockPage, testUser)(appTest.ctx);
      const outcome = await te();

      expect(outcome._tag).toBe("Left");
    });
  });

  describe("URL categorization", () => {
    it("should exclude telegram profile URLs", async () => {
      const message = {
        message_id: 1,
        text: "https://t.me/some_channel",
        date: 123,
        entities: [{ type: "url", offset: 0, length: 25 }],
      } as any;

      vi.mocked(parseURLs).mockImplementation((urls) => () =>
        fp.TE.right([]),
      );

      const parser = MessageParser(message);
      await pipe(parser.parseURLs(mockPage, testUser)(appTest.ctx), throwTE);

      // Telegram URLs should be excluded - called with O.none
      expect(parseURLs).toHaveBeenCalledWith(O.none, testUser, mockPage);
    });

    it("should put PDF URL into pdf bucket, not url bucket", async () => {
      const pdfUrl = "https://example.com/document.pdf";
      const message = {
        message_id: 1,
        text: `Report: ${pdfUrl}`,
        date: 123,
        entities: [{ type: "url", offset: 8, length: pdfUrl.length }],
      } as any;

      vi.mocked(parseURLs).mockImplementation((urls) => () =>
        fp.TE.right([]),
      );
      vi.mocked(parsePDFURLs).mockReturnValue(() =>
        fp.TE.right([uuid()]),
      );

      const parser = MessageParser(message);

      await pipe(parser.parseURLs(mockPage, testUser)(appTest.ctx), throwTE);
      await pipe(parser.parsePDFURLs(testUser)(appTest.ctx), throwTE);

      // PDF URL should not be in the regular url bucket (O.none)
      expect(parseURLs).toHaveBeenCalledWith(O.none, testUser, mockPage);
      // PDF URL should be in the pdf bucket
      expect(parsePDFURLs).toHaveBeenCalledWith(
        expect.arrayContaining([pdfUrl]),
      );
    });
  });
});
