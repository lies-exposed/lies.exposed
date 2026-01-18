import { describe, expect, it } from "vitest";
import { type UUID } from "../../../io/http/Common/UUID.js";
import { type Media } from "../../../io/http/index.js";
import {
  getShareMultipleMedia,
  getShareMedia,
} from "../getShareMedia.helper.js";

const createUUID = (id: string): UUID => id as UUID;

const createMedia = (
  id: string,
  type: Media.MediaType,
  overrides: Partial<Media.Media> = {},
): Media.Media =>
  ({
    id: createUUID(id),
    type,
    location: `http://media.com/${id}`,
    thumbnail: `http://media.com/${id}/thumb`,
    label: "Test Media",
    description: "Test description",
    extra: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Media.Media;

describe("getShareMultipleMedia", () => {
  const defaultImage = "http://default.com/image.png";

  describe("video media (MP4)", () => {
    it("should return video type for MP4 media", () => {
      // VideoExtra requires both duration and thumbnails fields
      const media = [
        createMedia("video-1", "video/mp4", {
          extra: { duration: 120, thumbnails: undefined },
        }),
      ];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("video");
      expect(result[0].media).toBe("http://media.com/video-1");
      expect(result[0].thumbnail).toBe("http://media.com/video-1/thumb");
      expect(result[0].duration).toBe(120);
    });

    it("should use default image when thumbnail is missing", () => {
      const media = [
        createMedia("video-1", "video/mp4", {
          thumbnail: undefined,
          extra: { duration: 60, thumbnails: undefined },
        }),
      ];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result[0].thumbnail).toBe(defaultImage);
    });

    it("should handle missing duration in extra", () => {
      const media = [createMedia("video-1", "video/mp4", { extra: undefined })];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result[0].duration).toBe(0);
    });
  });

  describe("PDF media", () => {
    it("should return photo type for PDF media", () => {
      const media = [createMedia("pdf-1", "application/pdf")];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("photo");
      expect(result[0].media).toBe("http://media.com/pdf-1");
    });

    it("should use default image when thumbnail is missing", () => {
      const media = [
        createMedia("pdf-1", "application/pdf", { thumbnail: undefined }),
      ];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result[0].thumbnail).toBe(defaultImage);
    });
  });

  describe("audio media (MP3/OGG)", () => {
    it("should skip MP3 media", () => {
      const media = [createMedia("audio-1", "audio/mp3")];

      const result = getShareMultipleMedia(media, defaultImage);

      // Audio is skipped, so should return default
      expect(result).toHaveLength(1);
      expect(result[0].media).toBe(defaultImage);
    });

    it("should skip OGG media", () => {
      const media = [createMedia("audio-1", "audio/ogg")];

      const result = getShareMultipleMedia(media, defaultImage);

      // Audio is skipped, so should return default
      expect(result).toHaveLength(1);
      expect(result[0].media).toBe(defaultImage);
    });
  });

  describe("image media", () => {
    it("should return photo type for PNG media", () => {
      const media = [createMedia("image-1", "image/png")];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("photo");
      expect(result[0].media).toBe("http://media.com/image-1/thumb");
    });

    it("should return photo type for JPG media", () => {
      const media = [createMedia("image-1", "image/jpg")];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("photo");
    });

    it("should return photo type for JPEG media", () => {
      const media = [createMedia("image-1", "image/jpeg")];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("photo");
    });

    it("should use location when thumbnail is missing", () => {
      const media = [
        createMedia("image-1", "image/png", { thumbnail: undefined }),
      ];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result[0].media).toBe("http://media.com/image-1");
    });
  });

  describe("multiple media types", () => {
    it("should process multiple media items", () => {
      const media = [
        createMedia("video-1", "video/mp4", {
          extra: { duration: 60, thumbnails: undefined },
        }),
        createMedia("image-1", "image/png"),
        createMedia("pdf-1", "application/pdf"),
      ];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe("video");
      expect(result[1].type).toBe("photo");
      expect(result[2].type).toBe("photo");
    });

    it("should skip audio in mixed media", () => {
      const media = [
        createMedia("video-1", "video/mp4", {
          extra: { duration: 60, thumbnails: undefined },
        }),
        createMedia("audio-1", "audio/mp3"),
        createMedia("image-1", "image/png"),
      ];

      const result = getShareMultipleMedia(media, defaultImage);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("video");
      expect(result[1].type).toBe("photo");
    });
  });

  describe("empty media", () => {
    it("should return default image when media array is empty", () => {
      const result = getShareMultipleMedia([], defaultImage);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("photo");
      expect(result[0].media).toBe(defaultImage);
      expect(result[0].thumbnail).toBe(defaultImage);
    });
  });
});

describe("getShareMedia", () => {
  const defaultImage = "http://default.com/image.png";

  it("should return the same result as getShareMultipleMedia", () => {
    const media = [createMedia("image-1", "image/png")];

    const multipleResult = getShareMultipleMedia(media, defaultImage);
    const shareResult = getShareMedia(media, defaultImage);

    expect(shareResult).toEqual(multipleResult);
  });

  it("should return default image for empty media", () => {
    const result = getShareMedia([], defaultImage);

    expect(result).toHaveLength(1);
    expect(result[0].media).toBe(defaultImage);
  });
});
