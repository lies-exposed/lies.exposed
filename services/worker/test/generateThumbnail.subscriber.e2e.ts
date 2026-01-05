import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { generateThumbnailFlow } from "@liexp/backend/lib/flows/media/thumbnails/generateThumbnails.flow.js";
import { GenerateThumbnailPubSub } from "@liexp/backend/lib/pubsub/media/generateThumbnail.pubSub.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { Arbs, fc } from "@liexp/test/lib/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { type WorkerTest, GetAppTest } from "./WorkerTest.js";

describe("GenerateThumbnail Subscriber", () => {
  let Test: WorkerTest;
  let testMedia: MediaEntity;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  beforeEach(async () => {
    // Mock fs operations
    Test.mocks.fs.existsSync.mockReturnValue(true);
    Test.mocks.fs.mkdirSync.mockReturnValue(undefined);
    Test.mocks.fs.writeFileSync.mockReturnValue(undefined);

    // Mock sharp image processing - sharp.toBuffer() returns { data, info }
    Test.mocks.sharp.mocks.toBuffer.mockResolvedValue({
      data: Buffer.from("processed-image"),
      info: {
        format: "png",
        width: 800,
        height: 600,
        channels: 4,
        premultiplied: false,
        size: 18,
      },
    });

    const media = fc.sample(Arbs.Media.MediaArb, 1);

    // Create test media without thumbnails before each test
    testMedia = await pipe(
      Test.ctx.db.save(MediaEntity, media.map(toMediaEntity)),
      fp.TE.map((m) => m[0]),
      throwTE,
    );
  });

  test("Should generate thumbnails for media when flow is executed", async () => {
    // Mock S3 upload to simulate successful thumbnail upload
    const thumbnailLocation = "https://example.com/thumbnails/test-thumb.jpg";
    Test.mocks.s3.client.send.mockResolvedValueOnce({
      Location: thumbnailLocation,
      $metadata: {},
    } as any);

    // Mock image processing
    Test.mocks.axios.get.mockResolvedValueOnce({
      status: 200,
      data: Buffer.from("fake-image-data"),
    });

    // Execute the thumbnail generation flow directly
    const result = await pipe(
      generateThumbnailFlow({ id: testMedia.id })(Test.ctx),
      throwTE,
    );

    expect(result).toMatchObject({
      id: testMedia.id,
      extra: expect.objectContaining({
        thumbnails: expect.any(Array),
        needRegenerateThumbnail: false,
      }),
    });

    // Verify the media was updated in the database
    const updatedMedia = await pipe(
      Test.ctx.db.findOneOrFail(MediaEntity, {
        where: { id: testMedia.id },
      }),
      throwTE,
    );

    expect(updatedMedia.extra).toMatchObject({
      thumbnails: expect.any(Array),
      needRegenerateThumbnail: false,
    });
  });

  test("Should publish message to generate thumbnail channel", async () => {
    // Mock redis publish
    Test.mocks.redis.publish.mockResolvedValueOnce(1);

    const publishResult = await pipe(
      GenerateThumbnailPubSub.publish({ id: testMedia.id })(Test.ctx),
      throwTE,
    );

    expect(publishResult).toBe(1);
    expect(Test.mocks.redis.publish).toHaveBeenCalledWith(
      GenerateThumbnailPubSub.channel,
      expect.any(String),
    );
  });

  test("Should handle thumbnail generation failure gracefully", async () => {
    // Create a mock Upload instance with failing done method
    const mockUploadInstance = {
      done: vi.fn().mockRejectedValue(new Error("S3 upload failed")),
    };

    // Spy on Upload constructor to return our failing instance
    vi.spyOn(Test.mocks.s3.classes, "Upload").mockImplementationOnce(
      () => mockUploadInstance as any,
    );

    // Mock image processing
    Test.mocks.axios.get.mockResolvedValueOnce({
      status: 200,
      data: Buffer.from("fake-image-data"),
    });

    // Execute the flow - should throw an error
    await expect(
      pipe(generateThumbnailFlow({ id: testMedia.id })(Test.ctx), throwTE),
    ).rejects.toThrow();
  });
});
