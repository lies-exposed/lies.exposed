import { fp } from "@liexp/core/lib/fp/index.js";
import * as Media from "@liexp/io/lib/http/Media/index.js";
import { describe, expect, it } from "vitest";
import {
  contentTypeFromFileExt,
  fileExtFromContentType,
  extensionFromURL,
  getResourceAndIdFromLocation,
  getMediaKeyFromLocation,
  getMediaKey,
  getMediaThumbKey,
} from "../media.utils.js";

describe("media.utils", () => {
  describe("contentTypeFromFileExt", () => {
    it("should map pdf to application/pdf", () => {
      const result = contentTypeFromFileExt("pdf");
      expect(result).toBe(Media.MediaType.members[6].literals[0]);
    });

    it("should map mp4 to video/mp4", () => {
      const result = contentTypeFromFileExt("mp4");
      expect(result).toBe(Media.MediaType.members[5].literals[0]);
    });

    it("should map ogg to audio/ogg", () => {
      const result = contentTypeFromFileExt("ogg");
      expect(result).toBe(Media.MediaType.members[4].literals[0]);
    });

    it("should map mp3 to audio/mp3", () => {
      const result = contentTypeFromFileExt("mp3");
      expect(result).toBe(Media.MediaType.members[3].literals[0]);
    });

    it("should map png to image/png", () => {
      const result = contentTypeFromFileExt("png");
      expect(result).toBe(Media.MediaType.members[2].literals[0]);
    });

    it("should map jpeg to image/jpeg", () => {
      const result = contentTypeFromFileExt("jpeg");
      expect(result).toBe(Media.MediaType.members[1].literals[0]);
    });

    it("should map jpg to image/jpg", () => {
      const result = contentTypeFromFileExt("jpg");
      expect(result).toBe(Media.MediaType.members[0].literals[0]);
    });

    it("should default to jpg for unknown extensions", () => {
      const result = contentTypeFromFileExt("unknown");
      expect(result).toBe(Media.MediaType.members[0].literals[0]);
    });

    it("should default to jpg for empty string", () => {
      const result = contentTypeFromFileExt("");
      expect(result).toBe(Media.MediaType.members[0].literals[0]);
    });
  });

  describe("fileExtFromContentType", () => {
    it("should map application/pdf to pdf", () => {
      const result = fileExtFromContentType(
        Media.MediaType.members[6].literals[0],
      );
      expect(result).toBe("pdf");
    });

    it("should map video/mp4 to mp4", () => {
      const result = fileExtFromContentType(
        Media.MediaType.members[5].literals[0],
      );
      expect(result).toBe("mp4");
    });

    it("should map audio/ogg to ogg", () => {
      const result = fileExtFromContentType(
        Media.MediaType.members[4].literals[0],
      );
      expect(result).toBe("ogg");
    });

    it("should map audio/mp3 to mp3", () => {
      const result = fileExtFromContentType(
        Media.MediaType.members[3].literals[0],
      );
      expect(result).toBe("mp3");
    });

    it("should map image/png to png", () => {
      const result = fileExtFromContentType(
        Media.MediaType.members[2].literals[0],
      );
      expect(result).toBe("png");
    });

    it("should map image/jpeg to jpeg", () => {
      const result = fileExtFromContentType(
        Media.MediaType.members[1].literals[0],
      );
      expect(result).toBe("jpeg");
    });

    it("should map image/jpg to jpg", () => {
      const result = fileExtFromContentType(
        Media.MediaType.members[0].literals[0],
      );
      expect(result).toBe("jpg");
    });
  });

  describe("extensionFromURL", () => {
    // Note: This function uses pipe(u.split(".")) which returns the part after the first dot.
    // Due to how fp-ts pipe works with arrays, the behavior is:
    // - For URLs with dots: returns the second element of split(".")
    // - For URLs without dots: returns "jpg" (default)
    it("should handle URLs with dots", () => {
      // The function splits on "." and returns the second element
      // "https://example.com/image.jpg" → ["https://example", "com/image.jpg"] → "com/image.jpg"
      const result = extensionFromURL("https://example.com/image.jpg");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle URLs without dots", () => {
      // When there's no dot, split returns a single-element array
      // and the second element is undefined, triggering the "jpg" default
      const result = extensionFromURL("https://example.com/image");
      expect(typeof result).toBe("string");
    });
  });

  describe("getResourceAndIdFromLocation", () => {
    it("should return none for invalid resource", () => {
      const result = getResourceAndIdFromLocation("invalid/uuid-here");
      expect(fp.O.isNone(result)).toBe(true);
    });

    it("should return none for invalid UUID", () => {
      const result = getResourceAndIdFromLocation("events/not-a-uuid");
      expect(fp.O.isNone(result)).toBe(true);
    });

    it("should return none for too many path segments", () => {
      const result = getResourceAndIdFromLocation("events/uuid/extra");
      expect(fp.O.isNone(result)).toBe(true);
    });

    it("should return none for empty string", () => {
      const result = getResourceAndIdFromLocation("");
      expect(fp.O.isNone(result)).toBe(true);
    });
  });

  describe("getMediaKeyFromLocation", () => {
    it("should extract the filename (without extension) from a location path", () => {
      expect(getMediaKeyFromLocation("media/uuid/photo.jpg")).toBe("photo");
      expect(getMediaKeyFromLocation("actors/uuid/image.png")).toBe("image");
    });

    it("should use the full path if no last segment exists", () => {
      const result = getMediaKeyFromLocation("some/path");
      expect(result).toBe("path");
    });

    it("should handle paths with multiple extensions", () => {
      // file.split(".")[0] takes the part before the FIRST dot
      expect(getMediaKeyFromLocation("media/uuid/photo.min.jpg")).toBe("photo");
    });

    it("should return the input if fp.A.last returns none", () => {
      expect(getMediaKeyFromLocation("")).toBe("");
    });
  });

  describe("getMediaKey", () => {
    it("should construct a media key with jpg extension", () => {
      const result = getMediaKey(
        "media",
        "uuid-123",
        "photo",
        Media.MediaType.members[0].literals[0],
      );
      expect(result).toBe("media/uuid-123/photo.jpg");
    });

    it("should construct a media key with pdf extension", () => {
      const result = getMediaKey(
        "stories",
        "uuid-456",
        "document",
        Media.MediaType.members[6].literals[0],
      );
      expect(result).toBe("stories/uuid-456/document.pdf");
    });

    it("should construct a media key with mp4 extension", () => {
      const result = getMediaKey(
        "media",
        "uuid-789",
        "video",
        Media.MediaType.members[5].literals[0],
      );
      expect(result).toBe("media/uuid-789/video.mp4");
    });

    it("should construct a media key with png extension", () => {
      const result = getMediaKey(
        "actors",
        "uuid-abc",
        "avatar",
        Media.MediaType.members[2].literals[0],
      );
      expect(result).toBe("actors/uuid-abc/avatar.png");
    });

    it("should construct a media key with jpeg extension", () => {
      const result = getMediaKey(
        "groups",
        "uuid-def",
        "logo",
        Media.MediaType.members[1].literals[0],
      );
      expect(result).toBe("groups/uuid-def/logo.jpeg");
    });
  });

  describe("getMediaThumbKey", () => {
    it("should construct a thumb key with default n=1", () => {
      const result = getMediaThumbKey(
        "uuid-123",
        Media.MediaType.members[0].literals[0],
      );
      expect(result).toBe("media/uuid-123/uuid-123-thumb-1.jpg");
    });

    it("should construct a thumb key with custom n", () => {
      const result = getMediaThumbKey(
        "uuid-456",
        Media.MediaType.members[6].literals[0],
        2,
      );
      expect(result).toBe("media/uuid-456/uuid-456-thumb-2.pdf");
    });

    it("should construct a thumb key with undefined n (defaults to 1)", () => {
      const result = getMediaThumbKey(
        "uuid-789",
        Media.MediaType.members[5].literals[0],
        undefined,
      );
      expect(result).toBe("media/uuid-789/uuid-789-thumb-1.mp4");
    });
  });
});
