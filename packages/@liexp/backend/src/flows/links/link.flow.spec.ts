import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";
import { URLArb } from "@liexp/test/lib/arbitrary/URL.arbitrary.js";
import fc from "fast-check";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { LinkEntity } from "../../entities/Link.entity.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { fetchAndSave, fromURL } from "./link.flow.js";

type LinkFlowContext = URLMetadataContext & LoggerContext & DatabaseContext;

describe("link.flow", () => {
  const appTest = {
    ctx: mockedContext<LinkFlowContext>({
      db: mock(),
      urlMetadata: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(fromURL.name, () => {
    it("should create a link from URL with fetched metadata", async () => {
      const [url] = fc.sample(URLArb, 1);
      const title = fc.sample(HumanReadableStringArb(), 1)[0];
      const description = fc.sample(HumanReadableStringArb(), 1)[0];

      const creator = new UserEntity();
      creator.id = uuid();

      appTest.ctx.urlMetadata.fetchMetadata.mockReturnValueOnce(
        fp.TE.right({
          title,
          description,
          url: url as string,
          image: null,
          keywords: ["test", "keyword"],
        }),
      );

      const result = await pipe(
        fromURL(creator, url, undefined)(appTest.ctx),
        throwTE,
      );

      expect(appTest.ctx.urlMetadata.fetchMetadata).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Function),
      );

      expect(result.title).toBe(title);
      expect(result.description).toBe(description);
      expect(result.creator).toBe(creator);
      expect(result.image).toBeNull();
    });

    it("should use defaults when provided", async () => {
      const [url] = fc.sample(URLArb, 1);
      const defaultTitle = "Default Title";
      const defaultDescription = "Default Description";

      const creator = new UserEntity();
      creator.id = uuid();

      appTest.ctx.urlMetadata.fetchMetadata.mockReturnValueOnce(
        fp.TE.right({
          title: "Fetched Title",
          description: "Fetched Description",
          url: url as string,
          image: null,
          keywords: [],
        }),
      );

      const result = await pipe(
        fromURL(creator, url, {
          title: defaultTitle,
          description: defaultDescription,
        })(appTest.ctx),
        throwTE,
      );

      expect(result.title).toBe(defaultTitle);
      expect(result.description).toBe(defaultDescription);
    });

    it("should handle metadata fetch error gracefully", async () => {
      const [url] = fc.sample(URLArb, 1);

      const creator = new UserEntity();
      creator.id = uuid();

      appTest.ctx.urlMetadata.fetchMetadata.mockReturnValueOnce(
        fp.TE.left({ message: "Network error" }),
      );

      const result = await pipe(
        fromURL(creator, url, undefined)(appTest.ctx),
        throwTE,
      );

      expect(result.url).toBeDefined();
      expect(result.title).toBeDefined();
    });

    it("should create media entity when image is present in metadata", async () => {
      const [url] = fc.sample(URLArb, 1);
      const imageUrl = "https://example.com/image.jpg" as URL;
      const title = fc.sample(HumanReadableStringArb(), 1)[0];

      const creator = new UserEntity();
      creator.id = uuid();

      appTest.ctx.urlMetadata.fetchMetadata.mockReturnValueOnce(
        fp.TE.right({
          title,
          description: "Description",
          url: url as string,
          image: imageUrl,
          keywords: [],
        }),
      );

      mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.none);

      const result = await pipe(
        fromURL(creator, url, undefined)(appTest.ctx),
        throwTE,
      );

      expect(result.image).not.toBeNull();
      expect(result.image?.location).toBe(imageUrl);
    });

    it("should reuse existing media entity when found by location", async () => {
      const [url] = fc.sample(URLArb, 1);
      const imageUrl = "https://example.com/existing-image.jpg" as URL;
      const title = fc.sample(HumanReadableStringArb(), 1)[0];

      const creator = new UserEntity();
      creator.id = uuid();

      const existingMedia = new MediaEntity();
      existingMedia.id = uuid();
      existingMedia.location = imageUrl;
      existingMedia.label = "Existing Image";

      appTest.ctx.urlMetadata.fetchMetadata.mockReturnValueOnce(
        fp.TE.right({
          title,
          description: "Description",
          url: url as string,
          image: imageUrl,
          keywords: [],
        }),
      );

      mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.some(existingMedia));

      const result = await pipe(
        fromURL(creator, url, undefined)(appTest.ctx),
        throwTE,
      );

      expect(appTest.ctx.db.findOne).toHaveBeenCalledWith(MediaEntity, {
        where: { location: imageUrl },
      });
      expect(result.image).not.toBeNull();
      expect(result.image?.id).toBe(existingMedia.id);
    });

    it("should parse publish date from metadata", async () => {
      const [url] = fc.sample(URLArb, 1);
      const publishDate = "2024-01-15T10:00:00.000Z";

      const creator = new UserEntity();
      creator.id = uuid();

      appTest.ctx.urlMetadata.fetchMetadata.mockReturnValueOnce(
        fp.TE.right({
          title: "Article Title",
          description: "Description",
          url: url as string,
          image: null,
          date: publishDate,
          keywords: [],
        }),
      );

      const result = await pipe(
        fromURL(creator, url, undefined)(appTest.ctx),
        throwTE,
      );

      expect(result.publishDate).toEqual(new Date(publishDate));
    });
  });

  describe(fetchAndSave.name, () => {
    it("should return existing link if found by URL", async () => {
      const [url] = fc.sample(URLArb, 1);

      const creator = new UserEntity();
      creator.id = uuid();

      const existingLink = new LinkEntity();
      existingLink.id = uuid();
      existingLink.url = url;
      existingLink.title = "Existing Link";

      mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.some(existingLink));

      const result = await pipe(
        fetchAndSave(creator, url)(appTest.ctx),
        throwTE,
      );

      expect(appTest.ctx.db.findOne).toHaveBeenCalledWith(LinkEntity, {
        where: { url: expect.anything() },
      });

      expect(result.id).toBe(existingLink.id);
      expect(result.title).toBe(existingLink.title);
    });

    it("should create and save new link if not found", async () => {
      const [url] = fc.sample(URLArb, 1);
      const title = fc.sample(HumanReadableStringArb(), 1)[0];

      const creator = new UserEntity();
      creator.id = uuid();

      mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.none);

      appTest.ctx.urlMetadata.fetchMetadata.mockReturnValueOnce(
        fp.TE.right({
          title,
          description: "New link description",
          url: url as string,
          image: null,
          keywords: [],
        }),
      );

      let savedLink: LinkEntity[] = [];
      mockTERightOnce(appTest.ctx.db.save, (_, links) => {
        savedLink = links as LinkEntity[];
        return links;
      });

      const result = await pipe(
        fetchAndSave(creator, url)(appTest.ctx),
        throwTE,
      );

      expect(appTest.ctx.db.save).toHaveBeenCalledWith(
        LinkEntity,
        expect.arrayContaining([
          expect.objectContaining({
            title,
          }),
        ]),
      );

      expect(result.title).toBe(title);
    });

    it("should not fetch metadata when link already exists", async () => {
      const [url] = fc.sample(URLArb, 1);

      const creator = new UserEntity();
      creator.id = uuid();

      const existingLink = new LinkEntity();
      existingLink.id = uuid();
      existingLink.url = url;

      mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.some(existingLink));

      await pipe(fetchAndSave(creator, url)(appTest.ctx), throwTE);

      expect(appTest.ctx.urlMetadata.fetchMetadata).not.toHaveBeenCalled();
    });
  });
});
