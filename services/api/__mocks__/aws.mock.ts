vi.mock("@aws-sdk/client-s3");

const awsMock = {
  config: {
    requestHandler: { handle: vi.fn(), destroy: vi.fn() },
    endpointProvider: () => ({ url: process.env.WEB_URL as any }),
    apiVersion: "v3",
  } as any,
  send: vi.fn().mockResolvedValue(undefined),
};

export { awsMock };
