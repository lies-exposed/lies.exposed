import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("OpenGraph metadata route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
    // Ensure the urlMetadata mock returns a Promise-compatible result
    // to avoid TaskEither/then TypeError seen in CI runs.
    Test.mocks.urlMetadata.fetchMetadata.mockResolvedValue({
      title: "Example Article",
      description: "An example article used in tests",
      url: "https://example.com/article/1",
      images: [],
    });
  });

  test("GET /v1/open-graph/metadata should return 200 and metadata for URL", async () => {
    const url = "https://example.com/article/1";
    const res = await Test.req.get(
      `/v1/open-graph/metadata?url=${encodeURIComponent(url)}&type=Link`,
    );

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("data");
    // data.metadata should exist (may be null if not found)
    expect(res.body.data).toHaveProperty("metadata");
  });
});
