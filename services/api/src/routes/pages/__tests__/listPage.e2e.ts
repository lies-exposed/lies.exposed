import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("ListPage route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("GET /v1/pages returns 200 and data array", async () => {
    const res = await Test.req.get("/v1/pages");
    expect(res.status).toEqual(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.total).toBeTypeOf("number");
  });
});
