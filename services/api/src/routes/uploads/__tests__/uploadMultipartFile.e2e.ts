import { getMediaKey } from "@liexp/shared/lib/utils/media.utils";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../test/AppTest";

describe("Upload file", () => {
  let Test: AppTest, authorizationToken: string;
  // const media: any[] = [];

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
  });

  afterEach(async () => {
    Test.mocks.s3.client.send.mockClear();
  });

  afterAll(async () => {
    // await throwTE(
    //   Test.ctx.db.delete(
    //     MediaEntity,
    //     media.map((e) => e.id)
    //   )
    // );
    // await Test.utils.e2eAfterAll();
  });

  test("Should receive an error when upload unaccepted media", async () => {
    const error = new Error("can't upload");
    Test.mocks.s3.client.send.mockImplementationOnce(() =>
      Promise.reject(error)
    );

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
      message: "can't upload",
      name: "SpaceError",
    });
  });

  test("Should upload media files with correct keys", async () => {
    const uploadedObject = {
      Key: fc.sample(fc.string(), 1)[0],
      Location: fc.sample(fc.webUrl(), 1)[0],
    };

    Test.mocks.s3.client.send.mockImplementationOnce(() =>
      Promise.resolve(uploadedObject)
    );

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
        getMediaKey("media", "file-key", "file-key", "image/jpeg")
      )
    );

    expect(response.body.data).toMatchObject({
      Bucket: Test.ctx.env.SPACE_BUCKET,
      Location: expectedLocation,
    });
  });
});
