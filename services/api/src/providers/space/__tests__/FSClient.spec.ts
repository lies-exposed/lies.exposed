import * as logger from "@econnessione/core/logger";
import * as E from "fp-ts/lib/Either";
// eslint-disable-next-line no-restricted-imports
import { GetFSClient } from "../FSClient";

describe.skip("FSClient", () => {
  const basePath = __dirname;
  const baseUrl = "http://localhost:4010";
  const dataFolder = "data/media";

  const fsClient = GetFSClient({
    basePath,
    baseUrl,
    dataFolder,
    logger: logger.GetLogger("FSClient"),
  });

  test("Should return the signedUrl for upload", async () => {
    const Key = "/actors/image.jpg";
    const result = await fsClient.getSignedUrl("putObject", {
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
    const result = await fsClient.upload({
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
