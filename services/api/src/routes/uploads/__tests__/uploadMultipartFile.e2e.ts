import { type MockUpload } from "@liexp/backend/lib/test/mocks/s3.mock.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { PngType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type MockInstance } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("Upload file", () => {
  let Test: AppTest, authorizationToken: string;

  let uploadSpy: MockInstance<new () => MockUpload>;
  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
    uploadSpy = vi.spyOn(Test.mocks.s3.classes, "Upload");
  });

  afterEach(() => {
    Test.mocks.s3.client.send.mockClear();
  });

  test("Should receive an error when upload unaccepted media", async () => {
    const error = new Error("can't upload");

    uploadSpy.mockImplementation(function () {
      this.done = vi.fn().mockRejectedValueOnce(error);
    });

    const response = await Test.req
      .put(`/v1/uploads-multipart/file-key`)
      .set("Authorization", authorizationToken)
      .field("resource", "media")
      .attach("media", Buffer.from("file-content", "utf-8"), {
        filename: "my doc.word",
        contentType: "doc/wordx",
      })
      .set("Content-Type", "multipart/form-data");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      name: "SpaceError",
      status: 500,
      details: {
        kind: "ServerError",
        meta: error.stack,
        status: "500",
      },
    });
  });

  test("Should upload media files with correct keys", async () => {
    const mediaId = uuid();
    const mediaKey = `media/${mediaId}/${mediaId}.png`;
    const uploadedObject = {
      Bucket: "media",
      Key: mediaKey,
      Location: `https://media.localhost:9000/media/${mediaKey}`,
    };

    uploadSpy.mockImplementation(function () {
      this.done = vi.fn().mockResolvedValueOnce(uploadedObject);
    });

    const response = await Test.req
      .put(`/v1/uploads-multipart/file-key`)
      .set("Authorization", authorizationToken)
      .field("resource", "media")
      .attach("media", Buffer.from("file-content", "utf-8"), {
        filename: "my image.jpeg",
        contentType: "image/jpeg",
      })
      .set("Content-Type", "multipart/form-data");

    expect(response.status).toBe(201);

    const expectedLocation = await throwTE(
      Test.ctx.s3.getEndpoint(
        Test.ctx.env.SPACE_BUCKET,
        getMediaKey("media", mediaId, mediaId, PngType.literals[0]),
      ),
    );

    expect(response.body.data).toMatchObject({
      Bucket: Test.ctx.env.SPACE_BUCKET,
      Location: expectedLocation,
    });
  });
});
