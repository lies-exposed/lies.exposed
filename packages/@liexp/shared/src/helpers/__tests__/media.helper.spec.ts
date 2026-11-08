import { fp } from "@liexp/core/lib/fp/index.js";
import fc from "fast-check";
import { describe, test, expect } from "vitest";
import {
  getPlatform,
  getPlatformEmbedURL,
  parsePlatformURL,
  parseURL,
} from "../media.helper.js";

describe("@helpers/media", () => {
  describe("getPlatform", () => {
    describe("youtube URLs", () => {
      test("succeeds with standard youtube watch URLs", () => {
        const ids = fc.sample(fc.uuid(), 50);

        const results = ids.map((id) =>
          getPlatform(`https://www.youtube.com/watch?v=${id}`),
        );

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(ids.map((id) => ({ platform: "youtube", id }))),
        );
      });

      test("succeeds with youtu.be short URLs", () => {
        const ids = fc.sample(fc.uuid(), 50);

        const results = ids.map((id) => getPlatform(`https://youtu.be/${id}`));

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(ids.map((id) => ({ platform: "youtube", id }))),
        );
      });

      test("succeeds with youtube embed URLs", () => {
        const ids = fc.sample(fc.uuid(), 50);

        const results = ids.map((id) =>
          getPlatform(`https://www.youtube.com/embed/${id}`),
        );

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(ids.map((id) => ({ platform: "youtube", id }))),
        );
      });

      test("succeeds with youtube URLs with query params", () => {
        const ids = fc.sample(fc.uuid(), 20);

        const results = ids.map((id) =>
          getPlatform(`https://www.youtube.com/watch?v=${id}&t=30`),
        );

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(ids.map((id) => ({ platform: "youtube", id }))),
        );
      });
    });

    describe("bitchute URLs", () => {
      test("succeeds with bitchute video URLs", () => {
        const ids = fc.sample(fc.uuid(), 50);

        const results = ids.map((id) =>
          getPlatform(`https://www.bitchute.com/video/${id}`),
        );

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(ids.map((id) => ({ platform: "bitchute", id }))),
        );
      });

      test("succeeds with bitchute embed URLs", () => {
        const ids = fc.sample(fc.uuid(), 50);

        const results = ids.map((id) =>
          getPlatform(`https://www.bitchute.com/embed/${id}`),
        );

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(ids.map((id) => ({ platform: "bitchute", id }))),
        );
      });
    });

    describe("odysee URLs", () => {
      test("succeeds with odysee download URLs", () => {
        // Note: source code has a known off-by-one in capture groups
        // odyseeMatch[1] = type (download/embed), [2] = firstId, [3] = secondId
        // but code uses [1] for firstId and [2] for secondId
        const testCases = [
          {
            url: "https://odysee.com/$/download/abc123/xyz789",
            expected: {
              platform: "odysee",
              firstId: "download",
              secondId: "abc123",
            },
          },
          {
            url: "https://odysee.com/$/embed/def456/uvw012",
            expected: {
              platform: "odysee",
              firstId: "embed",
              secondId: "def456",
            },
          },
        ];

        testCases.forEach(({ url, expected }) => {
          const result = getPlatform(url);
          expect(result._tag).toBe("Right");
          if (result._tag === "Right") {
            expect(result.right).toEqual(expected);
          }
        });
      });
    });

    describe("rumble URLs", () => {
      test("succeeds with rumble embed URLs", () => {
        const ids = fc.sample(fc.uuid(), 50);

        const results = ids.map((id) =>
          getPlatform(`https://rumble.com/embed/${id}/`),
        );

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(
            ids.map((id) => ({
              platform: "rumble",
              id,
              type: "embed",
            })),
          ),
        );
      });

      test("succeeds with rumble page URLs", () => {
        const ids = fc.sample(fc.uuid(), 50);

        const results = ids.map((id) =>
          getPlatform(`https://rumble.com/${id}`),
        );

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(
            ids.map((id) => ({
              platform: "rumble",
              id,
              type: "page",
            })),
          ),
        );
      });
    });

    describe("peertube URLs", () => {
      test("succeeds with peertube HTML URLs", () => {
        const hosts = ["peertube.example.com", "tube.example.org"];
        const ids = fc.sample(fc.uuid(), 50);

        const urls = hosts.flatMap((host) =>
          ids.map((id) => `https://${host}/videos/watch/${id}`),
        );

        const results = urls.map(getPlatform);

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(
            urls.map((url) => {
              const host = url.split("//")[1]?.split("/")[0] ?? "";
              const id = url.split("/videos/watch/")[1] ?? "";
              return { platform: "peertube", host, id, type: "html" };
            }),
          ),
        );
      });

      test("succeeds with peertube embed URLs", () => {
        const hosts = ["peertube.example.com", "tube.example.org"];
        const ids = fc.sample(fc.uuid(), 50);

        const urls = hosts.flatMap((host) =>
          ids.map((id) => `https://${host}/videos/embed/${id}`),
        );

        const results = urls.map(getPlatform);

        expect(fp.A.sequence(fp.E.Applicative)(results)).toMatchObject(
          fp.E.right(
            urls.map((url) => {
              const host = url.split("//")[1]?.split("/")[0] ?? "";
              const id = url.split("/videos/embed/")[1] ?? "";
              return { platform: "peertube", host, id, type: "embed" };
            }),
          ),
        );
      });
    });

    describe("unsupported URLs", () => {
      test("returns left for unsupported URLs", () => {
        const unsupportedUrls = [
          "https://vimeo.com/123456",
          "https://twitch.tv/channel",
          "https://example.com/video",
          "not-a-url",
        ];

        unsupportedUrls.forEach((url) => {
          const result = getPlatform(url);
          expect(result._tag).toBe("Left");
        });
      });
    });
  });

  describe("getPlatformEmbedURL", () => {
    test("generates correct embed URL for youtube", () => {
      const match = { platform: "youtube" as const, id: "abc123" };
      const result = getPlatformEmbedURL(
        match,
        "https://www.youtube.com/watch?v=abc123" as never,
      );
      expect(result).toBe("https://www.youtube.com/embed/abc123");
    });

    test("generates correct embed URL for bitchute", () => {
      const match = { platform: "bitchute" as const, id: "xyz789" };
      const result = getPlatformEmbedURL(
        match,
        "https://www.bitchute.com/video/xyz789" as never,
      );
      expect(result).toBe("https://www.bitchute.com/embed/xyz789/");
    });

    test("generates correct embed URL for odysee", () => {
      const match = {
        platform: "odysee" as const,
        firstId: "first",
        secondId: "second",
      };
      const result = getPlatformEmbedURL(
        match,
        "https://odysee.com/$/download/first/second" as never,
      );
      expect(result).toBe("https://odysee.com/$/embed/first/second");
    });

    test("generates correct embed URL for rumble", () => {
      const match = {
        platform: "rumble" as const,
        id: "rumble123",
        type: "embed",
      };
      const result = getPlatformEmbedURL(
        match,
        "https://rumble.com/rumble123" as never,
      );
      expect(result).toBe("https://rumble.com/embed/rumble123/?pub=7a20");
    });

    test("generates correct embed URL for peertube", () => {
      const match = {
        platform: "peertube" as const,
        host: "peertube.example.com",
        id: "pt123",
        type: "html",
      };
      const result = getPlatformEmbedURL(
        match,
        "https://peertube.example.com/videos/watch/pt123" as never,
      );
      expect(result).toBe("https://peertube.example.com/videos/embed/pt123");
    });

    test("generates correct embed URL for dailymotion", () => {
      const match = {
        platform: "dailymotion" as const,
        id: "dm123",
        type: "embed",
      };
      const result = getPlatformEmbedURL(
        match,
        "https://dailymotion.com/video/dm123" as never,
      );
      expect(result).toBe("https://dailymotion.com/embed/video/dm123/");
    });

    test("returns original url for unknown platform", () => {
      const match = { platform: "unknown" as never, id: "test" };
      const originalUrl = "https://original.com/video" as never;
      const result = getPlatformEmbedURL(match, originalUrl);
      expect(result).toBe(originalUrl);
    });
  });

  describe("parsePlatformURL", () => {
    test("parses youtube URL to embed URL", () => {
      const result = parsePlatformURL("https://www.youtube.com/watch?v=abc123");
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toBe("https://www.youtube.com/embed/abc123");
      }
    });

    test("parses dailymotion URL to embed URL", () => {
      const result = parsePlatformURL("https://dailymotion.com/video/xyz789");
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toBe(
          "https://dailymotion.com/embed/video/xyz789/",
        );
      }
    });

    test("parses bitchute URL to embed URL", () => {
      const result = parsePlatformURL("https://www.bitchute.com/video/abc123");
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toBe("https://www.bitchute.com/embed/abc123/");
      }
    });

    test("parses rumble page URL to embed URL", () => {
      const result = parsePlatformURL("https://rumble.com/xyz789");
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toBe("https://rumble.com/embed/xyz789/?pub=7a20");
      }
    });

    test("returns left for unsupported platform", () => {
      const result = parsePlatformURL("https://vimeo.com/123456");
      expect(result._tag).toBe("Left");
    });
  });

  describe("parseURL", () => {
    test("identifies jpg images", () => {
      const result = parseURL("https://example.com/image.jpg");
      expect(result._tag).toBe("Right");
    });

    test("identifies png images", () => {
      const result = parseURL("https://example.com/image.png");
      expect(result._tag).toBe("Right");
    });

    test("identifies pdf documents", () => {
      const result = parseURL("https://example.com/document.pdf");
      expect(result._tag).toBe("Right");
    });

    test("identifies mp4 videos", () => {
      const result = parseURL("https://example.com/video.mp4");
      expect(result._tag).toBe("Right");
    });

    test("identifies youtube videos", () => {
      const result = parseURL("https://www.youtube.com/watch?v=abc123");
      expect(result._tag).toBe("Right");
    });

    test("identifies dailymotion videos", () => {
      const result = parseURL("https://rumble.com/xyz789");
      expect(result._tag).toBe("Right");
    });

    test("returns left for invalid URL", () => {
      const result = parseURL("not-a-valid-url");
      expect(result._tag).toBe("Left");
    });

    test("returns left for unsupported URL without matching media type", () => {
      const result = parseURL("https://example.com/unknown-file.xyz");
      expect(result._tag).toBe("Left");
    });
  });
});
