jest.mock("@aws-sdk/client-s3");

const awsMock = {
  config: {
    requestHandler: { handle: jest.fn(), destroy: jest.fn(),  },
    endpointProvider: () => ({ url: process.env.WEB_URL as any, }),
    apiVersion: "v3",
  } as any,
  send: jest.fn().mockResolvedValue(undefined),
};

export { awsMock };
