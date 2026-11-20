import * as logger from "@liexp/core/lib/logger/index.js";
import * as E from "fp-ts/lib/Either.js";
import { describe, test, expect, vi } from "vitest";
import { GetLocalSpaceProvider } from "../local-space.provider.js";

vi.mock("axios");

const baseURL = "http://localhost:4010";

const getUri = vi.fn<() => string>();
const get = vi.fn();
const post = vi.fn();

const axiosMock = {
  defaults: {
    baseURL,
  },
  getUri,
  get,
  post,
} as unknown as Parameters<typeof GetLocalSpaceProvider>[0]["client"];

describe("LocalSpaceClient", () => {
  const localSpaceClient = GetLocalSpaceProvider({
    client: axiosMock,
    logger: logger.GetLogger("FSClient"),
  });

  test("Should return the signedUrl for upload", async () => {
    const Key = "actors/actor-id/image.jpg";
    const Location = `${baseURL}/public/${Key}?Content-Type=multipart/form-data;boundary=---test-boundary`;
    getUri.mockReturnValue(baseURL);
    get.mockRejectedValue({
      data: {
        data: {
          Location,
          Key,
        },
      },
    });

    const result = await localSpaceClient.getSignedUrl({
      Key,
      Bucket: "not-relevant",
    })();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(Location);
    }
  });

  test("Should upload the file at the given path", async () => {
    const Key = "/data/media/actors/image.jpg";
    const Location = `${baseURL}/public${Key}`;
    post.mockResolvedValue({
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
    expect(result).toEqual(
      E.right({
        Location: "",
        Key: "",
        $metadata: {},
      }),
    );
  });
});
