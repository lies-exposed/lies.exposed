import * as logger from "@econnessione/core/logger";
import * as E from "fp-ts/lib/Either";
// eslint-disable-next-line no-restricted-imports
import { GetLocalSpaceClient } from "../LocalSpaceClient";

describe.skip("LocalSpaceClient", () => {
  const baseUrl = "http://localhost:4010";
  const dataFolder = "data/media";

  const localSpaceClient = GetLocalSpaceClient({
    baseUrl,
    logger: logger.GetLogger("FSClient"),
  });

  test("Should return the signedUrl for upload", async () => {
    const Key = "/actors/image.jpg";
    const result = await localSpaceClient.getSignedUrl("putObject", {
      Key,
      Bucket: "not-relevant",
    })();

    expect(E.isRight(result)).toBe(true);
    expect((result as any).right).toEqual(
      `${baseUrl}/v1/uploads/${dataFolder}${Key}`
    );
  });

  test("Should upload the file at the given path", async () => {
    const Key = "/data/media/actors/image.jpg";
    const result = await localSpaceClient.upload({
      Key,
      Bucket: "not-relevant",
    })();

    expect(E.isRight(result)).toBe(true);
    expect((result as any).right).toEqual({
      Bucket: "not-relevant",
      ETag: "",
      Key: Key,
      Location: `${baseUrl}${Key}`,
    });
  });
});
