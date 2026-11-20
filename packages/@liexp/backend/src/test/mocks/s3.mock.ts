import { EventEmitter } from "node:events";
import { type S3Client } from "@aws-sdk/client-s3";
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

/** Shape of an `@aws-sdk/lib-storage` Upload instance used by the space provider. */
export interface UploadInstanceLike {
  emitter: EventEmitter;
  done(): Promise<typeof defaultUploadResponse>;
}

// Mock Upload constructor (callable with `new`) that produces a fresh instance
class MockUpload {
  emitter = new EventEmitter();
  done = vi.fn<() => Promise<typeof defaultUploadResponse>>(() =>
    Promise.resolve(defaultUploadResponse),
  );
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
    send: vi.fn(() => Promise.reject(new Error("Not implemented"))),
    destroy: vi.fn(() => undefined),
  }),
  classes: {
    Upload: vi.fn(function upload(this: unknown) {
      return new MockUpload();
    }) as unknown as (new (options?: unknown) => UploadInstanceLike) & {
      prototype: UploadInstanceLike;
    },
  },
  getSignedUrl: vi.fn((): string => {
    throw new Error("Not implemented");
  }),
};

export { MockUpload, s3Mock };
