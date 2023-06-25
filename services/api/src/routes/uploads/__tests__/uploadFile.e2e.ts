import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import { UncategorizedArb } from "@liexp/shared/lib/tests";
import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { addDays } from "date-fns";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { MediaEntity } from "@entities/Media.entity";

describe("Upload file", () => {
  let Test: AppTest, authorizationToken: string, media: any[];

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
  });

  afterEach(async () => {
    await throwTE(
      Test.ctx.db.delete(
        MediaEntity,
        media.map((e) => e.id)
      )
    );
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should upload media files with correct keys", async () => {
    const response = await Test.req
      .post(`/v1/uploads-multipart/file-key`)
      .set("Authorization", authorizationToken)
      .expect(201);

    expect(response.body.url).toBe("");
  });
});
