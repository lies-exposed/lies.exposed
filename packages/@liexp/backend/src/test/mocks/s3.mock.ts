import { type S3Client } from "@aws-sdk/client-s3";
import { type Upload } from "@aws-sdk/lib-storage";
import { vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

// Default successful upload response
const defaultUploadResponse = {
  Location: `https://${process.env.SPACE_ENDPOINT}/${process.env.SPACE_BUCKET}/test-upload.jpg`,
  ETag: '"mock-etag"',
  Bucket: process.env.SPACE_BUCKET,
  Key: "test-upload.jpg",
  $metadata: {},
};

// Mock Upload class that works as a constructor
class MockUpload {
  done = vi.fn().mockResolvedValue(defaultUploadResponse);

  constructor() {
    // Each instance gets its own done method
  }
}

const s3Mock = {
  client: mockDeep<S3Client>({
    config: {
      endpoint: () =>
        Promise.resolve({
          protocol: "https:",
          hostname: `${process.env.SPACE_ENDPOINT}/${process.env.SPACE_BUCKET}`,
          path: "/",
          query: undefined,
        }),
    },
    send: vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Not implemented"))),
    destroy: vi.fn().mockResolvedValue(undefined),
  }),
  classes: {
    Upload: MockUpload as unknown as typeof Upload,
  },
  getSignedUrl: vi.fn(),
};

export { s3Mock, MockUpload };
