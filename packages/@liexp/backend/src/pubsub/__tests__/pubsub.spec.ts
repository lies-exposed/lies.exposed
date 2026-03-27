import { describe, expect, it } from "vitest";
import { BuildImageWithSharpPubSub } from "../buildImageWithSharp.pubSub.js";
import { PostToSocialPlatformsPubSub } from "../postToSocialPlatforms.pubSub.js";
import { SearchFromWikipediaPubSub } from "../searchFromWikipedia.pubSub.js";
import { CreateEventFromURLPubSub } from "../events/createEventFromURL.pubSub.js";
import { SearchLinksPubSub } from "../links/searchLinks.pubSub.js";
import { TakeLinkScreenshotPubSub } from "../links/takeLinkScreenshot.pubSub.js";
import { ProcessJobDonePubSub } from "../jobs/processJobDone.pubSub.js";
import { CreateMediaThumbnailPubSub } from "../media/createThumbnail.pubSub.js";
import { ExtractMediaExtraPubSub } from "../media/extractMediaExtra.pubSub.js";
import { GenerateThumbnailPubSub } from "../media/generateThumbnail.pubSub.js";
import { TransferMediaFromExternalProviderPubSub } from "../media/transferFromExternalProvider.pubSub.js";
import { CreateEntityStatsPubSub } from "../stats/createEntityStats.pubSub.js";
import { ExtractEntitiesWithNLP } from "../nlp/extractEntitiesWithNLP.pubSub.js";

const TEST_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TEST_URL = "https://example.com/test";

describe("PubSub channel definitions", () => {
  describe("BuildImageWithSharpPubSub", () => {
    it("has correct channel name", () => {
      expect(BuildImageWithSharpPubSub.channel).toBe("image:build-with-sharp");
    });

    it("decodes valid input with null image", () => {
      const result = BuildImageWithSharpPubSub.decoder({
        image: null,
        layers: [],
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes valid input with UUID image and text layer", () => {
      const result = BuildImageWithSharpPubSub.decoder({
        image: TEST_UUID,
        layers: [
          {
            type: "text",
            text: "Hello",
            color: undefined,
            blend: "over",
            gravity: "center",
            width: undefined,
            height: undefined,
            background: undefined,
          },
        ],
      });
      expect(result._tag).toBe("Right");
    });

    it("returns Left for missing required fields", () => {
      const result = BuildImageWithSharpPubSub.decoder({ image: null });
      expect(result._tag).toBe("Left");
    });
  });

  describe("SearchFromWikipediaPubSub", () => {
    it("has correct channel name", () => {
      expect(SearchFromWikipediaPubSub.channel).toBe(
        "search:search-from-wikipedia",
      );
    });

    it("decodes valid Actor search", () => {
      const result = SearchFromWikipediaPubSub.decoder({
        search: "Albert Einstein",
        provider: "wikipedia",
        type: "Actor",
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes valid Group search", () => {
      const result = SearchFromWikipediaPubSub.decoder({
        search: "NASA",
        provider: "wikipedia",
        type: "Group",
      });
      expect(result._tag).toBe("Right");
    });

    it("returns Left for invalid type", () => {
      const result = SearchFromWikipediaPubSub.decoder({
        search: "test",
        provider: "wikipedia",
        type: "InvalidType",
      });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for missing fields", () => {
      const result = SearchFromWikipediaPubSub.decoder({ search: "test" });
      expect(result._tag).toBe("Left");
    });
  });

  describe("PostToSocialPlatformsPubSub", () => {
    it("has correct channel name", () => {
      expect(PostToSocialPlatformsPubSub.channel).toBe("post-social-post");
    });

    it("has a decoder function", () => {
      expect(typeof PostToSocialPlatformsPubSub.decoder).toBe("function");
    });

    it("returns Left when id is missing", () => {
      const result = PostToSocialPlatformsPubSub.decoder({ title: "Test" });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for completely empty input", () => {
      const result = PostToSocialPlatformsPubSub.decoder({});
      expect(result._tag).toBe("Left");
    });
  });

  describe("CreateEventFromURLPubSub", () => {
    it("has correct channel name", () => {
      expect(CreateEventFromURLPubSub.channel).toBe("event:create-from-url");
    });

    it("decodes valid input", () => {
      const result = CreateEventFromURLPubSub.decoder({
        url: TEST_URL,
        type: "Death",
        eventId: TEST_UUID,
        userId: TEST_UUID,
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes with all event types", () => {
      const eventTypes = [
        "Book",
        "Death",
        "Documentary",
        "ScientificStudy",
        "Patent",
        "Transaction",
        "Quote",
        "Uncategorized",
      ] as const;

      for (const type of eventTypes) {
        const result = CreateEventFromURLPubSub.decoder({
          url: TEST_URL,
          type,
          eventId: TEST_UUID,
          userId: TEST_UUID,
        });
        expect(result._tag, `type=${type}`).toBe("Right");
      }
    });

    it("returns Left for invalid event type", () => {
      const result = CreateEventFromURLPubSub.decoder({
        url: TEST_URL,
        type: "InvalidType",
        eventId: TEST_UUID,
        userId: TEST_UUID,
      });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for missing fields", () => {
      const result = CreateEventFromURLPubSub.decoder({ url: TEST_URL });
      expect(result._tag).toBe("Left");
    });
  });

  describe("SearchLinksPubSub", () => {
    it("has correct channel name", () => {
      expect(SearchLinksPubSub.channel).toBe("link:search");
    });

    it("has a decoder function", () => {
      expect(typeof SearchLinksPubSub.decoder).toBe("function");
    });
  });

  describe("TakeLinkScreenshotPubSub", () => {
    it("has correct channel name", () => {
      expect(TakeLinkScreenshotPubSub.channel).toBe("link:take-screenshot");
    });

    it("decodes valid UUID payload", () => {
      const result = TakeLinkScreenshotPubSub.decoder({ id: TEST_UUID });
      expect(result._tag).toBe("Right");
    });

    it("returns Left when id is not a UUID", () => {
      const result = TakeLinkScreenshotPubSub.decoder({ id: "not-a-uuid" });
      expect(result._tag).toBe("Left");
    });

    it("returns Left when id is missing", () => {
      const result = TakeLinkScreenshotPubSub.decoder({});
      expect(result._tag).toBe("Left");
    });
  });

  describe("ProcessJobDonePubSub", () => {
    it("has correct channel name", () => {
      expect(ProcessJobDonePubSub.channel).toBe("job:process-done");
    });

    it("decodes valid payload", () => {
      const result = ProcessJobDonePubSub.decoder({
        id: TEST_UUID,
        type: "openai-create-event-from-url",
        resource: "events",
      });
      expect(result._tag).toBe("Right");
    });

    it("returns Left for invalid type", () => {
      const result = ProcessJobDonePubSub.decoder({
        id: TEST_UUID,
        type: "invalid-type",
        resource: "events",
      });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for missing fields", () => {
      const result = ProcessJobDonePubSub.decoder({ id: TEST_UUID });
      expect(result._tag).toBe("Left");
    });
  });

  describe("CreateMediaThumbnailPubSub", () => {
    it("has correct channel name", () => {
      expect(CreateMediaThumbnailPubSub.channel).toBe("media:create-thumbnail");
    });

    it("decodes valid payload with null thumbnail", () => {
      const result = CreateMediaThumbnailPubSub.decoder({
        id: TEST_UUID,
        location: TEST_URL,
        thumbnail: null,
        type: "image/png",
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes valid payload with thumbnail URL", () => {
      const result = CreateMediaThumbnailPubSub.decoder({
        id: TEST_UUID,
        location: TEST_URL,
        thumbnail: TEST_URL,
        type: "video/mp4",
      });
      expect(result._tag).toBe("Right");
    });

    it("returns Left for invalid media type", () => {
      const result = CreateMediaThumbnailPubSub.decoder({
        id: TEST_UUID,
        location: TEST_URL,
        thumbnail: null,
        type: "invalid/type",
      });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for missing fields", () => {
      const result = CreateMediaThumbnailPubSub.decoder({ id: TEST_UUID });
      expect(result._tag).toBe("Left");
    });
  });

  describe("ExtractMediaExtraPubSub", () => {
    it("has correct channel name", () => {
      expect(ExtractMediaExtraPubSub.channel).toBe("media:extract-media-extra");
    });

    it("decodes valid UUID payload", () => {
      const result = ExtractMediaExtraPubSub.decoder({ id: TEST_UUID });
      expect(result._tag).toBe("Right");
    });

    it("returns Left when id is not a UUID", () => {
      const result = ExtractMediaExtraPubSub.decoder({ id: "not-a-uuid" });
      expect(result._tag).toBe("Left");
    });
  });

  describe("GenerateThumbnailPubSub", () => {
    it("has correct channel name", () => {
      expect(GenerateThumbnailPubSub.channel).toBe("media:generate-thumbnail");
    });

    it("decodes valid UUID payload", () => {
      const result = GenerateThumbnailPubSub.decoder({ id: TEST_UUID });
      expect(result._tag).toBe("Right");
    });

    it("returns Left when id is not a UUID", () => {
      const result = GenerateThumbnailPubSub.decoder({ id: 12345 });
      expect(result._tag).toBe("Left");
    });
  });

  describe("TransferMediaFromExternalProviderPubSub", () => {
    it("has correct channel name", () => {
      expect(TransferMediaFromExternalProviderPubSub.channel).toBe(
        "media:transfer-from-external-provider",
      );
    });

    it("decodes valid payload", () => {
      const result = TransferMediaFromExternalProviderPubSub.decoder({
        mediaId: TEST_UUID,
        url: TEST_URL,
        fileName: "image.jpg",
        mimeType: "image/jpg",
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes all valid mime types", () => {
      const mimeTypes = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "audio/mp3",
        "audio/ogg",
        "video/mp4",
        "application/pdf",
        "iframe/video",
      ] as const;

      for (const mimeType of mimeTypes) {
        const result = TransferMediaFromExternalProviderPubSub.decoder({
          mediaId: TEST_UUID,
          url: TEST_URL,
          fileName: "file",
          mimeType,
        });
        expect(result._tag, `mimeType=${mimeType}`).toBe("Right");
      }
    });

    it("returns Left for invalid mime type", () => {
      const result = TransferMediaFromExternalProviderPubSub.decoder({
        mediaId: TEST_UUID,
        url: TEST_URL,
        fileName: "file",
        mimeType: "text/plain",
      });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for missing fields", () => {
      const result = TransferMediaFromExternalProviderPubSub.decoder({
        mediaId: TEST_UUID,
      });
      expect(result._tag).toBe("Left");
    });
  });

  describe("CreateEntityStatsPubSub", () => {
    it("has correct channel name", () => {
      expect(CreateEntityStatsPubSub.channel).toBe("stats:create-entity");
    });

    it("decodes valid keywords type", () => {
      const result = CreateEntityStatsPubSub.decoder({
        type: "keywords",
        id: TEST_UUID,
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes valid groups type", () => {
      const result = CreateEntityStatsPubSub.decoder({
        type: "groups",
        id: TEST_UUID,
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes valid actors type", () => {
      const result = CreateEntityStatsPubSub.decoder({
        type: "actors",
        id: TEST_UUID,
      });
      expect(result._tag).toBe("Right");
    });

    it("returns Left for invalid type", () => {
      const result = CreateEntityStatsPubSub.decoder({
        type: "events",
        id: TEST_UUID,
      });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for missing id", () => {
      const result = CreateEntityStatsPubSub.decoder({ type: "keywords" });
      expect(result._tag).toBe("Left");
    });
  });

  describe("ExtractEntitiesWithNLP", () => {
    it("has correct channel name", () => {
      expect(ExtractEntitiesWithNLP.channel).toBe("nlp:extract-entities");
    });

    it("decodes URL input variant", () => {
      const result = ExtractEntitiesWithNLP.decoder({ url: TEST_URL });
      expect(result._tag).toBe("Right");
    });

    it("decodes PDF input variant", () => {
      const result = ExtractEntitiesWithNLP.decoder({
        pdf: "https://example.com/doc.pdf",
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes text input variant", () => {
      const result = ExtractEntitiesWithNLP.decoder({
        text: "Extract entities from this text",
      });
      expect(result._tag).toBe("Right");
    });

    it("decodes resource input variant", () => {
      const result = ExtractEntitiesWithNLP.decoder({
        resource: "actors",
        uuid: TEST_UUID,
      });
      expect(result._tag).toBe("Right");
    });

    it("returns Left for invalid resource name", () => {
      const result = ExtractEntitiesWithNLP.decoder({
        resource: "invalid-resource",
        uuid: TEST_UUID,
      });
      expect(result._tag).toBe("Left");
    });

    it("returns Left for empty object", () => {
      const result = ExtractEntitiesWithNLP.decoder({});
      expect(result._tag).toBe("Left");
    });
  });
});
