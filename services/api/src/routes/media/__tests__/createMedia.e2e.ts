import { MediaArb } from "@liexp/shared/tests";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { MediaEntity } from "@entities/Media.entity";

describe("Create Media", () => {
  let Test: AppTest, authorizationToken: string;
  const mediaIds: string[] = [];
  const users: any[] = [];

  beforeAll(async () => {
    Test = GetAppTest();
    const user = await saveUser(Test, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    // await throwTE(
    //   Test.ctx.db.delete(
    //     EventV2Entity,
    //     [event].map((e) => e.id)
    //   )
    // );

    await throwTE(Test.ctx.db.delete(MediaEntity, mediaIds));
  });

  test("Should create a media", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 100)
      .map(({ createdAt, updatedAt, id, ...m }) => ({
        ...m,
        creator: undefined,
      }));

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    expect(response.status).toEqual(200);

    delete media.thumbnail;
    delete media.deletedAt;

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

    expect(response.status).toEqual(200);

    mediaIds.push(response.body.data.id);

    await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media)
      .expect(500);
  });
});
