import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("Healthcheck route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("GET /v1/healthcheck should return 200 and OK status", async () => {
    const res = await Test.req.get("/v1/healthcheck");
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toMatchObject({ status: "OK" });
  });
});
