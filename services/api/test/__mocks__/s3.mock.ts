vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@aws-sdk/lib-storage");

const s3Mock = {
  client: {
    config: {
      requestHandler: { handle: vi.fn(), destroy: vi.fn() },
      endpoint: () =>
        Promise.resolve({
          protocol: "https:",
          hostname: process.env.SPACE_ENDPOINT,
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
