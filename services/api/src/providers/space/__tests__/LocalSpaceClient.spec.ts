import * as logger from "@econnessione/core/logger";
import * as E from "fp-ts/lib/Either";
// eslint-disable-next-line no-restricted-imports
import { GetLocalSpaceClient } from "../LocalSpaceClient";

const baseURL = "http://localhost:4010";

const axiosMock = {
  defaults: {
    baseURL
  },
  getUri: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
};

describe("LocalSpaceClient", () => {
  

  const localSpaceClient = GetLocalSpaceClient({
    client: axiosMock as any,
    logger: logger.GetLogger("FSClient"),
  });

  test("Should return the signedUrl for upload", async () => {
    const Key = "actors/actor-id/image.jpg";
    const Location = `${baseURL}/public/${Key}?Content-Type=multipart/form-data;boundary=---test-boundary`;
    axiosMock.getUri.mockReturnValue(baseURL);
    axiosMock.get.mockRejectedValue({
      data: {
        data: {
          Location,
        },
      },
    });

    const result = await localSpaceClient.getSignedUrl("putObject", {
      Key,
      Bucket: "not-relevant",
    })();

    expect(E.isRight(result)).toBe(true);
    expect((result as any).right).toEqual(Location);
  });

  test("Should upload the file at the given path", async () => {
    const Key = "/data/media/actors/image.jpg";
    const Location = `${baseURL}/public${Key}`;
    axiosMock.post.mockResolvedValue({
      data: {
        data: {
          Location,
        },
      },
    });
    const result = await localSpaceClient.upload({
      Key,
      Bucket: "not-relevant",
      Body: "File content",
    })();

    expect(E.isRight(result)).toBe(true);
    expect((result as any).right).toEqual({
      Bucket: "not-relevant",
      ETag: "",
      Key: Key,
      Location: Location,
    });
  });
});
