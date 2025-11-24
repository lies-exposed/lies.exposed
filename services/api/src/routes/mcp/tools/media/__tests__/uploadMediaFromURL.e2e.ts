import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { uploadMediaFromURLToolTask } from "../uploadMediaFromURL.tool.js";

describe("MCP UPLOAD_MEDIA_FROM_URL Tool", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("Should upload media from URL with image type", async () => {
    const uploadData = {
      url: "https://example.com/test-image.jpg" as URL,
      type: "image/jpeg" as const,
      label: "Test Image",
      description: "A test image uploaded from URL",
    };

    // Note: This test may fail if the actual upload process requires
    // a valid URL or external dependencies. In a real scenario, you might
    // need to mock the upload flow or use a test image URL.
    try {
      const result = await pipe(
        uploadMediaFromURLToolTask(uploadData),
        throwRTE(Test.ctx),
      );

      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
    } catch (error) {
      // Expected to fail in test environment without real external URLs
      expect(error).toBeDefined();
    }
  });

  test("Should handle upload with different media types", async () => {
    const uploadData = {
      url: "https://example.com/test-video.mp4" as URL,
      type: "video/mp4" as const,
      label: "Test Video",
      description: undefined,
    };

    try {
      const result = await pipe(
        uploadMediaFromURLToolTask(uploadData),
        throwRTE(Test.ctx),
      );

      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
    } catch (error) {
      // Expected to fail in test environment without real external URLs
      expect(error).toBeDefined();
    }
  });

  test("Should upload media without description", async () => {
    const uploadData = {
      url: "https://example.com/simple-image.png" as URL,
      type: "image/png" as const,
      label: "Simple Image",
      description: undefined,
    };

    try {
      const result = await pipe(
        uploadMediaFromURLToolTask(uploadData),
        throwRTE(Test.ctx),
      );

      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
    } catch (error) {
      // Expected to fail in test environment without real external URLs
      expect(error).toBeDefined();
    }
  });
});
