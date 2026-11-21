import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { type URL } from "@liexp/io/lib/http/Common/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "fp-ts/lib/Option.js";
import { type Page } from "puppeteer-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { LinkEntity } from "../../entities/Link.entity.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { type QueueEntity } from "../../entities/Queue.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { fromURL } from "../../flows/links/link.flow.js";
import { takeLinkScreenshot } from "../../flows/links/takeLinkScreenshot.flow.js";
import { DBError } from "../../providers/orm/database.provider.js";
import {
  GetQueueProvider,
  type QueueProvider,
} from "../../providers/queue.provider.js";
import { LinkRepository } from "../../services/entity-repository.service.js";
import { mockedContext } from "../../test/context.js";
import { TEST_BACKEND_ENV } from "../../test/env.js";
import { parseURLs } from "./parseURL.flow.js";

// Mock heavy module-level dependencies that cannot be satisfied through ctx
vi.mock("../../flows/links/link.flow.js", () => ({
  fromURL: vi.fn(),
}));

vi.mock("../../flows/links/takeLinkScreenshot.flow.js", () => ({
  takeLinkScreenshot: vi.fn(),
}));

vi.mock("../../providers/queue.provider.js", () => ({
  GetQueueProvider: {
    queue: vi.fn().mockReturnValue({
      addJob: vi.fn(),
    }),
  },
}));

vi.mock("../../services/entity-repository.service.js", () => ({
  LinkRepository: {
    save: vi.fn(),
  },
}));

type TestContext = LoggerContext &
  DatabaseContext &
  URLMetadataContext &
  QueuesProviderContext &
  PuppeteerProviderContext &
  SpaceContext &
  ENVContext;

const queueProviderMock = mock<QueueProvider<QueueEntity, DatabaseContext>>();

queueProviderMock.addJob.mockReturnValue(() => fp.TE.right({} as QueueEntity));

const makeLinkImage = (thumbnail: string | null): MediaEntity =>
  Object.assign(new MediaEntity(), {
    id: uuid(),
    thumbnail: thumbnail === null ? null : (`${thumbnail}` as URL),
    location: `https://example.com/media/image.jpg` as URL,
  });

describe(parseURLs.name, () => {
  const mockPage = mock<Page>();

  const appTest = {
    ctx: {
      ...mockedContext<TestContext>({
        db: mock(),
        urlMetadata: mock(),
        queues: mock(),
        puppeteer: mock(),
        space: mock(),
      }),
      env: TEST_BACKEND_ENV,
    },
  };

  const testUser = { id: uuid() } as UserEntity;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return an empty array when urls is O.none", async () => {
    vi.mocked(LinkRepository.save).mockReturnValue(() => fp.TE.right([]));

    const result = await pipe(
      parseURLs(O.none, testUser, mockPage)(appTest.ctx),
      throwTE,
    );

    expect(result).toEqual([]);
    expect(LinkRepository.save).toHaveBeenCalledWith([]);
  });

  it("should return an empty array when urls is an empty O.some", async () => {
    vi.mocked(LinkRepository.save).mockReturnValue(() => fp.TE.right([]));

    const result = await pipe(
      parseURLs(O.some([]), testUser, mockPage)(appTest.ctx),
      throwTE,
    );

    expect(result).toEqual([]);
  });

  it("should filter out excluded telegram profile URLs", async () => {
    vi.mocked(LinkRepository.save).mockReturnValue(() => fp.TE.right([]));

    const excludedUrl = "https://t.me/some_channel" as string;

    const result = await pipe(
      parseURLs(O.some([excludedUrl]), testUser, mockPage)(appTest.ctx),
      throwTE,
    );

    expect(result).toEqual([]);
    expect(LinkRepository.save).toHaveBeenCalledWith([]);
  });

  it("should return the existing link id when the link is already in the db", async () => {
    const linkId = uuid();
    const existingLink = new LinkEntity();
    existingLink.id = linkId;
    existingLink.url = "https://example.com/article" as string;
    existingLink.image = null;

    const validUrl = "https://example.com/article" as string;

    // Link is found in db
    appTest.ctx.db.findOne.mockReturnValueOnce(
      fp.TE.right(O.some(existingLink)),
    );

    vi.mocked(LinkRepository.save).mockReturnValue(() =>
      fp.TE.right([existingLink]),
    );

    const result = await pipe(
      parseURLs(O.some([validUrl]), testUser, mockPage)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.findOne).toHaveBeenCalledWith(
      LinkEntity,
      expect.objectContaining({ where: expect.any(Object) }),
    );
    expect(result).toEqual([linkId]);
    // fromURL should NOT be called since link already exists
    expect(fromURL).not.toHaveBeenCalled();
  });

  it("should create a new link and add to queue when link is not found in db", async () => {
    const linkId = uuid();
    const newLink = new LinkEntity();
    newLink.id = linkId;
    newLink.url = "https://example.com/news" as string;
    newLink.image = makeLinkImage("thumb.jpg");

    const validUrl = "https://example.com/news" as string;

    // Link is NOT found in db
    appTest.ctx.db.findOne.mockReturnValueOnce(fp.TE.right(O.none));

    // fromURL creates a new link
    vi.mocked(fromURL).mockReturnValue(() => fp.TE.right(newLink));

    // Queue addJob resolves successfully
    vi.mocked(GetQueueProvider.queue).mockReturnValue(queueProviderMock);

    vi.mocked(LinkRepository.save).mockReturnValue(() =>
      fp.TE.right([newLink]),
    );

    const result = await pipe(
      parseURLs(O.some([validUrl]), testUser, mockPage)(appTest.ctx),
      throwTE,
    );

    expect(fromURL).toHaveBeenCalledWith(testUser, validUrl, {});
    expect(result).toEqual([linkId]);
  });

  it("should take a screenshot when the created link has no thumbnail", async () => {
    const linkId = uuid();
    const newLink = new LinkEntity();
    newLink.id = linkId;
    newLink.url = "https://example.com/no-thumb" as string;
    // No thumbnail on image
    newLink.image = makeLinkImage(null);

    const screenshotLink = Object.assign(new LinkEntity(), {
      ...newLink,
      image: makeLinkImage("new-thumb.jpg"),
    });

    const validUrl = "https://example.com/no-thumb" as string;

    appTest.ctx.db.findOne.mockReturnValueOnce(fp.TE.right(O.none));

    vi.mocked(fromURL).mockReturnValue(() => fp.TE.right(newLink));
    vi.mocked(takeLinkScreenshot).mockReturnValue(() =>
      fp.TE.right(screenshotLink),
    );

    vi.mocked(GetQueueProvider.queue).mockReturnValue(queueProviderMock);

    vi.mocked(LinkRepository.save).mockReturnValue(() =>
      fp.TE.right([screenshotLink]),
    );

    const result = await pipe(
      parseURLs(O.some([validUrl]), testUser, mockPage)(appTest.ctx),
      throwTE,
    );

    expect(takeLinkScreenshot).toHaveBeenCalledWith(newLink);
    expect(result).toEqual([linkId]);
  });

  it("should continue (not fail) when screenshot fails, logging a warning", async () => {
    const linkId = uuid();
    const newLink = new LinkEntity();
    newLink.id = linkId;
    newLink.url = "https://example.com/screenshot-fail" as string;
    newLink.image = null;

    const validUrl = "https://example.com/screenshot-fail" as string;

    appTest.ctx.db.findOne.mockReturnValueOnce(fp.TE.right(O.none));
    vi.mocked(fromURL).mockReturnValue(() => fp.TE.right(newLink));
    // Screenshot fails
    vi.mocked(takeLinkScreenshot).mockReturnValue(() =>
      fp.TE.left({ name: "PuppeteerError", message: "timeout" }),
    );

    vi.mocked(GetQueueProvider.queue).mockReturnValue(queueProviderMock);

    vi.mocked(LinkRepository.save).mockReturnValue(() =>
      fp.TE.right([newLink]),
    );

    // Should NOT throw even though screenshot failed
    const result = await pipe(
      parseURLs(O.some([validUrl]), testUser, mockPage)(appTest.ctx),
      throwTE,
    );

    expect(result).toEqual([linkId]);
  });

  it("should return a Left when db.findOne fails", async () => {
    const dbError = new DBError("db error", {
      kind: "ServerError",
      status: "500",
      meta: [],
    });
    const validUrl = "https://example.com/db-fail" as string;

    appTest.ctx.db.findOne.mockReturnValueOnce(fp.TE.left(dbError));

    const te = parseURLs(O.some([validUrl]), testUser, mockPage)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
  });
});
