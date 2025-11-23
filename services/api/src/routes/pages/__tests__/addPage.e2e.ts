import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { PageArb } from "@liexp/test/lib/arbitrary/Page.arbitrary.js";
import fc from "fast-check";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("AddPage route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("unauthorized POST /v1/pages should return 401", async () => {
    const payload = { title: "t", content: "c", url: "https://ex.com/p" };
    const res = await Test.req.post("/v1/pages").send(payload);
    expect(res.status).toEqual(401);
  });

  test("create page happy path (property-based)", async () => {
    const user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);

    // sample one payload from the PageArb
    const [payload] = fc.sample(PageArb, 1);

    const res = await Test.req
      .post("/v1/pages")
      .set("Authorization", authorization)
      .send(payload);

    expect(201).toBe(res.status);
    expect(res.body).toHaveProperty("data");
  });
});
