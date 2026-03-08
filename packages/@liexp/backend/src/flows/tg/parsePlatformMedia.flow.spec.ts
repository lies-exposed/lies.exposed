import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "fp-ts/lib/Option.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type ImgProcClientContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";

vi.mock("../media/extractMediaFromPlatform.flow.js", () => ({
  extractMediaFromPlatform: vi.fn(),
}));

vi.mock("../media/extra/extractMediaExtra.flow.js", () => ({
  extractMediaExtra: vi.fn(),
}));

vi.mock("../../services/entity-repository.service.js", () => ({
  MediaRepository: {
    save: vi.fn(),
  },
}));

import { extractMediaFromPlatform } from "../media/extractMediaFromPlatform.flow.js";
import { extractMediaExtra } from "../media/extra/extractMediaExtra.flow.js";
import { MediaRepository } from "../../services/entity-repository.service.js";
import { parsePlatformMedia } from "./parsePlatformMedia.flow.js";

type ParsePlatformMediaContext = LoggerContext &
  DatabaseContext &
  FFMPEGProviderContext &
  ConfigContext &
  HTTPProviderContext &
  ImgProcClientContext &
  SpaceContext &
  ENVContext &
  FSClientContext;

describe(parsePlatformMedia.name, () => {
  const appTest = {
    ctx: mockedContext<ParsePlatformMediaContext>({
      db: mock(),
      ffmpeg: mock(),
      http: mock(),
      imgProc: mock(),
      space: mock(),
      fs: mock(),
      s3: mock(),
    }),
  };

  const mockPage = {} as any;

  const testUser = Object.assign(new UserEntity(), {
    id: uuid(),
    username: "admin",
  });

  const testURL = "https://www.youtube.com/watch?v=test123" as any;
  const testMatch = { platform: "youtube", id: "test123" } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create new media when not found in database", async () => {
    const mediaId = uuid();
    const platformMedia = {
      location: "https://www.youtube.com/embed/test123" as any,
      type: "iframe/video-youtube",
      description: "Test video",
    };

    const savedMedia = Object.assign(new MediaEntity(), {
      id: mediaId,
      location: platformMedia.location,
      description: platformMedia.description,
      extra: null,
    });

    vi.mocked(extractMediaFromPlatform).mockReturnValue(() =>
      fp.TE.right(platformMedia as any),
    );

    // Media not found in DB
    appTest.ctx.db.findOne.mockReturnValueOnce(fp.TE.right(O.none));

    // Save new media
    appTest.ctx.db.save.mockReturnValueOnce(fp.TE.right([savedMedia]));

    vi.mocked(extractMediaExtra).mockReturnValue(() =>
      fp.TE.right(null),
    );

    vi.mocked(MediaRepository.save).mockReturnValue(() =>
      fp.TE.right([savedMedia]),
    );

    const result = await pipe(
      parsePlatformMedia(testURL, testMatch, mockPage, testUser)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mediaId);
    expect(appTest.ctx.db.findOne).toHaveBeenCalledWith(
      MediaEntity,
      expect.objectContaining({
        where: { location: platformMedia.location },
      }),
    );
    expect(appTest.ctx.db.save).toHaveBeenCalledWith(
      MediaEntity,
      expect.arrayContaining([
        expect.objectContaining({
          location: platformMedia.location,
          creator: { id: testUser.id },
        }),
      ]),
    );
  });

  it("should return existing media when found in database", async () => {
    const mediaId = uuid();
    const existingMedia = Object.assign(new MediaEntity(), {
      id: mediaId,
      location: "https://www.youtube.com/embed/test123" as any,
      description: "Existing video",
      extra: null,
    });

    const platformMedia = {
      location: "https://www.youtube.com/embed/test123" as any,
      type: "iframe/video-youtube",
      description: "Test video",
    };

    vi.mocked(extractMediaFromPlatform).mockReturnValue(() =>
      fp.TE.right(platformMedia as any),
    );

    // Media found in DB
    appTest.ctx.db.findOne.mockReturnValueOnce(
      fp.TE.right(O.some(existingMedia)),
    );

    vi.mocked(extractMediaExtra).mockReturnValue(() =>
      fp.TE.right(null),
    );

    vi.mocked(MediaRepository.save).mockReturnValue(() =>
      fp.TE.right([existingMedia]),
    );

    const result = await pipe(
      parsePlatformMedia(testURL, testMatch, mockPage, testUser)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mediaId);
    // Should NOT call db.save for new media since it already exists
    expect(appTest.ctx.db.save).not.toHaveBeenCalled();
  });

  it("should return empty array when platformMedia has no location", async () => {
    const platformMedia = {
      location: undefined,
      type: "iframe/video-youtube",
      description: "Test video",
    };

    vi.mocked(extractMediaFromPlatform).mockReturnValue(() =>
      fp.TE.right(platformMedia as any),
    );

    // When location is falsy, media array is empty []
    // extractMediaExtra will be called with undefined
    vi.mocked(extractMediaExtra).mockReturnValue(() =>
      fp.TE.right(null),
    );

    vi.mocked(MediaRepository.save).mockReturnValue(() =>
      fp.TE.right([]),
    );

    const result = await pipe(
      parsePlatformMedia(testURL, testMatch, mockPage, testUser)(appTest.ctx),
      throwTE,
    );

    // When no media found, the fp.TE.chain destructures [media] from [] which is undefined
    // so extractMediaExtra is called with undefined, MediaRepository.save returns []
    expect(result).toHaveLength(0);
    expect(appTest.ctx.db.findOne).not.toHaveBeenCalled();
  });

  it("should merge extra info when extractMediaExtra returns extra data", async () => {
    const mediaId = uuid();
    const platformMedia = {
      location: "https://www.youtube.com/embed/test123" as any,
      type: "iframe/video-youtube",
      description: "Test video",
    };

    const savedMedia = Object.assign(new MediaEntity(), {
      id: mediaId,
      location: platformMedia.location,
      description: platformMedia.description,
      extra: { thumbnails: [] },
    });

    const extraInfo = { thumbnails: [{ url: "https://thumb.jpg" }] };

    vi.mocked(extractMediaFromPlatform).mockReturnValue(() =>
      fp.TE.right(platformMedia as any),
    );

    appTest.ctx.db.findOne.mockReturnValueOnce(fp.TE.right(O.none));
    appTest.ctx.db.save.mockReturnValueOnce(fp.TE.right([savedMedia]));

    vi.mocked(extractMediaExtra).mockReturnValue(() =>
      fp.TE.right(extraInfo as any),
    );

    vi.mocked(MediaRepository.save).mockReturnValue(() =>
      fp.TE.right([savedMedia]),
    );

    const result = await pipe(
      parsePlatformMedia(testURL, testMatch, mockPage, testUser)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(MediaRepository.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          extra: expect.objectContaining({ thumbnails: extraInfo.thumbnails }),
        }),
      ]),
    );
  });

  it("should return Left when extractMediaFromPlatform fails", async () => {
    vi.mocked(extractMediaFromPlatform).mockReturnValue(() =>
      fp.TE.left({ name: "ServerError", message: "extract failed" } as any),
    );

    const te = parsePlatformMedia(
      testURL,
      testMatch,
      mockPage,
      testUser,
    )(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(appTest.ctx.db.findOne).not.toHaveBeenCalled();
  });

  it("should return Left when db.findOne fails", async () => {
    const platformMedia = {
      location: "https://www.youtube.com/embed/test123" as any,
      type: "iframe/video-youtube",
    };

    vi.mocked(extractMediaFromPlatform).mockReturnValue(() =>
      fp.TE.right(platformMedia as any),
    );

    appTest.ctx.db.findOne.mockReturnValueOnce(
      fp.TE.left({ name: "DBError", message: "db error" } as any),
    );

    const te = parsePlatformMedia(
      testURL,
      testMatch,
      mockPage,
      testUser,
    )(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
  });
});
