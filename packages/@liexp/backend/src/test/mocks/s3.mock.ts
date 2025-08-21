import { vi } from "vitest";

const s3Mock = {
  client: {
    config: {
      requestHandler: { handle: vi.fn(), destroy: vi.fn() },
      endpoint: () =>
        Promise.resolve({
          protocol: "https:",
          hostname: `${process.env.SPACE_ENDPOINT}/${process.env.SPACE_BUCKET}`,
          path: "/",
          query: undefined,
        }),
      apiVersion: "v3",
    } as any,
    send: vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Not implemented"))),
  },
  classes: {
    Upload: vi.fn().mockRejectedValue(new Error("Upload not implemented")),
  },
  getSignedUrl: vi.fn(),
};

export { s3Mock };
