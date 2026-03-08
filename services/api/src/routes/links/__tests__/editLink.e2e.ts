import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { describe, test, expect, beforeAll } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Edit Link", () => {
  let Test: AppTest,
    authorizationToken: string,
    adminAuthorization: string,
    user,
    linkId: string;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const adminUser = await saveUser(Test.ctx, [
      "admin:create",
      "admin:edit",
      "admin:read",
    ]);
    const { authorization: adminAuth } = await loginUser(Test)(adminUser);
    adminAuthorization = adminAuth;

    // Create a link to use in edit tests
    const createRes = await Test.req
      .post("/v1/links")
      .set("Authorization", adminAuthorization)
      .send({
        url: "https://example.com/original",
        title: "Original Title",
        status: "DRAFT",
        events: [],
      });
    linkId = createRes.body?.data?.id;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.put("/v1/links/fake-id").send({
      title: "Updated Title",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:edit' permission", async () => {
    const response = await Test.req
      .put("/v1/links/fake-id")
      .set("Authorization", authorizationToken)
      .send({
        title: "Updated Title",
      });

    expect(response.status).toEqual(401);
  });

  test("Should update link status without providing url, preserving existing url", async () => {
    if (!linkId) return;

    const response = await Test.req
      .put(`/v1/links/${linkId}`)
      .set("Authorization", adminAuthorization)
      .send({
        title: "Original Title",
        description: "",
        status: "APPROVED",
        events: [],
        keywords: [],
        creator: null,
        overrideThumbnail: null,
      });

    expect(response.status).toEqual(200);
    expect(response.body.data.url).toEqual("https://example.com/original");
    expect(response.body.data.status).toEqual("APPROVED");
  });

  test("Should override url when a new url is provided", async () => {
    if (!linkId) return;

    const newUrl = "https://example.com/overridden";

    const response = await Test.req
      .put(`/v1/links/${linkId}`)
      .set("Authorization", adminAuthorization)
      .send({
        title: "Original Title",
        description: "",
        url: newUrl,
        status: "DRAFT",
        events: [],
        keywords: [],
        creator: null,
        overrideThumbnail: null,
      });

    expect(response.status).toEqual(200);
    expect(response.body.data.url).toEqual(newUrl);
  });
});
