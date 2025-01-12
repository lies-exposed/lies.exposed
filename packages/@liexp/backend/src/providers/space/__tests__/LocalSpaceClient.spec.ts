import * as logger from "@liexp/core/lib/logger/index.js";
import * as E from "fp-ts/lib/Either.js";
import { describe, test, expect, vi } from "vitest";

import { GetLocalSpaceProvider } from "../local-space.provider.js";
vi.mock("axios");

const baseURL = "http://localhost:4010";

const axiosMock = {
  defaults: {
    baseURL,
  },
  getUri: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
};

describe("LocalSpaceClient", () => {
  const localSpaceClient = GetLocalSpaceProvider({
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

    const result = await localSpaceClient.getSignedUrl({
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
      Location: "",
      $metadata: {},
    });
  });
});
