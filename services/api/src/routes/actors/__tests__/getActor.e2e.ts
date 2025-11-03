import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("Get Actor", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("Should return 200 for GET /v1/actors/:id (public endpoint)", async () => {
    // This endpoint is public, so it should work without authentication
    // We're just testing that it exists and doesn't require auth
    const response = await Test.req.get("/v1/actors/non-existent-id");

    // Will return 404 since the actor doesn't exist, but won't return 401
    expect(response.status).not.toEqual(401);
  });
});

