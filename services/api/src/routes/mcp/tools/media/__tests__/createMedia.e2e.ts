import { afterEach, beforeEach } from "node:test";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createMediaToolTask } from "../createMedia.tool.js";

describe("MCP CREATE_MEDIA Tool", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  beforeEach(() => {
    Test.mocks.axios.get.mockResolvedValue({
      status: 200,
      data: {},
    } as any);
  });

  afterEach(() => {
    Test.mocks.axios.get.mockReset();
  });

  test("Should create media with external URL", async () => {
    const newMediaData = {
      location: "https://example.com/external-image.jpg" as URL,
      type: "image/jpeg" as const,
      label: "External Image",
      description: "An external image reference",
    };

    const result = await pipe(
      createMediaToolTask(newMediaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content.text).toContain(newMediaData.label);
  });

  test("Should create media without description", async () => {
    const newMediaData = {
      location: "https://example.com/simple-media.png" as URL,
      type: "image/png" as const,
      label: "Simple Media",
      description: undefined,
    };

    const result = await pipe(
      createMediaToolTask(newMediaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create media with PDF type", async () => {
    const newMediaData = {
      location: "https://example.com/document.pdf" as URL,
      type: "application/pdf" as const,
      label: "PDF Document",
      description: "A PDF document reference",
    };

    const result = await pipe(
      createMediaToolTask(newMediaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create media with video type", async () => {
    const newMediaData = {
      location: "https://example.com/video.mp4" as URL,
      type: "video/mp4" as const,
      label: "Video File",
      description: undefined,
    };

    const result = await pipe(
      createMediaToolTask(newMediaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create media with detailed description", async () => {
    const newMediaData = {
      location: "https://example.com/detailed-image.jpg" as URL,
      type: "image/jpeg" as const,
      label: "Detailed Image",
      description:
        "This is a comprehensive description of the image with multiple details",
    };

    const result = await pipe(
      createMediaToolTask(newMediaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
