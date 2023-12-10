import { MediaArb } from "@liexp/shared/lib/tests";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { MediaEntity } from "#entities/Media.entity.js";
import { UserEntity } from "#entities/User.entity.js";

describe("Create Media", () => {
  let Test: AppTest, authorizationToken: string;
  const mediaIds: string[] = [];
  const users: any[] = [];

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(MediaEntity, mediaIds));
    await throwTE(
      Test.ctx.db.delete(
        UserEntity,
        users.map((u) => u.id),
      ),
    );

    await Test.utils.e2eAfterAll();
  });

  test("Should create a media", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 100)
      .map(({ createdAt, updatedAt, id, ...m }, i) => ({
        ...m,
        location: `${m.location}?${i}`,
        creator: undefined,
      }));

    Test.mocks.axios.get.mockImplementation(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    Test.mocks.s3.client.send.mockImplementation(() => {
      return Promise.resolve({
        Location: tests.fc.sample(tests.fc.webUrl(), 1)[0],
      });
    });

    Test.mocks.s3.classes.Upload.mockReset().mockImplementation(() => ({
      done: vi.fn().mockResolvedValueOnce({
        Location: tests.fc.sample(tests.fc.webUrl(), 1)[0],
      }),
    }));

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    expect(Test.mocks.axios.get).toHaveBeenCalledTimes(1);

    expect(response.status).toEqual(200);

    delete media.label;
    delete media.description;
    delete media.thumbnail;
    delete media.extra;
    delete media.deletedAt;
    delete media.socialPosts;

    expect(response.body.data).toMatchObject({
      ...media,
      creator: users[0].id,
    });

    mediaIds.push(response.body.data.id);
  });

  test("Should get an error when 'location' in media is duplicated", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 100)
      .map(({ id, createdAt, updatedAt, ...m }) => ({
        ...m,
        creator: undefined,
      }));

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    Test.mocks.axios.get.mockImplementationOnce(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    Test.mocks.s3.client.send.mockImplementation(() => {
      return Promise.resolve({
        Location: tests.fc.sample(tests.fc.webUrl(), 1)[0],
      });
    });

    expect(response.status).toEqual(200);

    mediaIds.push(response.body.data.id);

    await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media)
      .expect(500);
  });
});
