import { Readable } from "stream";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type ENVContext } from "../../context/env.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { mockedContext } from "../../test/context.js";
import { upload } from "./upload.flow.js";

type UploadContext = SpaceContext & ENVContext;

describe(upload.name, () => {
  const appTest = {
    ctx: {
      ...mockedContext<UploadContext>({
        s3: mock(),
      }),
      env: {
        SPACE_BUCKET: "test-bucket",
      } as any,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload file to space with public-read ACL", async () => {
    const fileContent = Buffer.from("test content");
    const key = "media/test-file.jpg";

    const uploadResult = {
      Location: `https://test-bucket.s3.amazonaws.com/${key}`,
      ETag: '"abc123"',
      Bucket: "test-bucket",
      Key: key,
    };

    appTest.ctx.s3.upload.mockReturnValueOnce(fp.TE.right(uploadResult));

    const result = await pipe(
      upload({
        Key: key,
        Body: fileContent,
        ContentType: "image/jpeg",
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.s3.upload).toHaveBeenCalledWith({
      Bucket: "test-bucket",
      Key: key,
      Body: fileContent,
      ContentType: "image/jpeg",
      ACL: "public-read",
    });

    expect(result.Location).toBe(uploadResult.Location);
  });

  it("should use default bucket from env context", async () => {
    const key = "uploads/document.pdf";

    appTest.ctx.s3.upload.mockReturnValueOnce(
      fp.TE.right({
        Location: `https://test-bucket.s3.amazonaws.com/${key}`,
      }),
    );

    await pipe(
      upload({
        Key: key,
        Body: Buffer.from("pdf content"),
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.s3.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "test-bucket",
      }),
    );
  });

  it("should allow overriding the bucket", async () => {
    const customBucket = "custom-bucket";
    const key = "files/custom.txt";

    appTest.ctx.s3.upload.mockReturnValueOnce(
      fp.TE.right({
        Location: `https://${customBucket}.s3.amazonaws.com/${key}`,
      }),
    );

    await pipe(
      upload({
        Bucket: customBucket,
        Key: key,
        Body: Buffer.from("custom content"),
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.s3.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: customBucket,
      }),
    );
  });

  it("should handle stream body", async () => {
    const key = "streams/large-file.bin";
    const stream = Readable.from(["chunk1", "chunk2"]);

    appTest.ctx.s3.upload.mockReturnValueOnce(
      fp.TE.right({
        Location: `https://test-bucket.s3.amazonaws.com/${key}`,
      }),
    );

    const result = await pipe(
      upload({
        Key: key,
        Body: stream,
      })(appTest.ctx),
      throwTE,
    );

    expect(result.Location).toContain(key);
  });
});
