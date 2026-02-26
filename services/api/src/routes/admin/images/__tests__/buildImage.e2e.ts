import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { BuildImageWithSharpPubSub } from "@liexp/backend/lib/pubsub/buildImageWithSharp.pubSub.js";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

const VALID_PAYLOAD = {
  layers: {
    media: {
      type: "media",
      url: "https://example.com/image.png",
      blend: "over",
      gravity: "center",
      width: 800,
      height: 600,
      background: undefined,
    },
    text: {
      type: "text",
      text: "Test meme caption",
      color: "000000",
      blend: "over",
      gravity: "south",
      width: 800,
      height: 100,
      background: undefined,
    },
    watermark: undefined,
  },
};

describe("Build Image", () => {
  let Test: AppTest,
    authorizationToken: string,
    adminAuthorizationToken: string,
    user,
    adminUser;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    adminUser = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization: adminAuth } = await loginUser(Test)(adminUser);
    adminAuthorizationToken = adminAuth;
  });

  beforeEach(() => {
    // Reset sharp mock so toBuffer can resolve fresh for each test
    const fakeImageBuffer = Buffer.from("fake-png-data");
    (Test.mocks.sharp.mocks.composite as any).mockReturnThis();
    (Test.mocks.sharp.mocks.sharpen as any).mockReturnThis();
    (Test.mocks.sharp.mocks.toFormat as any).mockReturnThis();
    (Test.mocks.sharp.mocks.toBuffer as any).mockResolvedValue(fakeImageBuffer);
    (Test.mocks.sharp.mocks.resize as any).mockReturnThis();
    // Mock http provider to return a fake image buffer for URL fetching
    (Test.mocks.axios.get as any).mockResolvedValue({
      data: fakeImageBuffer,
      status: 200,
      headers: { "content-type": "image/png" },
    });
    // Mock ExifReader to return fake image dimensions
    (Test.mocks.exifR.load as any).mockResolvedValue({
      "Image Width": { value: 800 },
      "Image Height": { value: 600 },
    });
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/admins/images/build").send({
      eventId: "fake-event-id",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/admins/images/build")
      .set("Authorization", authorizationToken)
      .send({
        eventId: "fake-event-id",
      });

    expect(response.status).toEqual(401);
  });

  test("Should build image and return base64 encoded PNG with watermark when admin sends valid layers", async () => {
    const response = await Test.req
      .post("/v1/admins/images/build")
      .set("Authorization", adminAuthorizationToken)
      .send(VALID_PAYLOAD);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("data");
    expect(typeof response.body.data).toBe("string");
    // Verify the response is a valid base64 string
    const decoded = Buffer.from(response.body.data, "base64");
    expect(decoded.length).toBeGreaterThan(0);
  });

  test("Should automatically include watermark even when not provided in request", async () => {
    const payloadWithoutWatermark = {
      layers: {
        ...VALID_PAYLOAD.layers,
        watermark: undefined,
      },
    };

    const response = await Test.req
      .post("/v1/admins/images/build")
      .set("Authorization", adminAuthorizationToken)
      .send(payloadWithoutWatermark);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("data");
    expect(typeof response.body.data).toBe("string");
  });

  test("Should publish to Redis and return { success: true } when defer is true", async () => {
    Test.mocks.redis.publish.mockResolvedValueOnce(1);

    const response = await Test.req
      .post("/v1/admins/images/build")
      .set("Authorization", adminAuthorizationToken)
      .send({ ...VALID_PAYLOAD, defer: true });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ data: { success: true } });
    expect(Test.mocks.redis.publish).toHaveBeenCalledWith(
      BuildImageWithSharpPubSub.channel,
      expect.any(String),
    );
  });
});
