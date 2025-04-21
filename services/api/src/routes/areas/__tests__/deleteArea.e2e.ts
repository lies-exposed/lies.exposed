import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { type Area } from "@liexp/shared/lib/io/http/Area.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("Delete Area", () => {
  let Test: AppTest, areas: Area[], authorizationToken: string;
  beforeAll(async () => {
    Test = await GetAppTest();

    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    areas = tests.fc.sample(AreaArb, 1);
    await throwTE(
      Test.ctx.db.save(
        AreaEntity,
        areas.map((a) => ({
          ...a,
          media: [],
          events: [],
          socialPosts: [],
          featuredImage: null,
        })),
      ),
    );
  });

  test("Should return a 200", async () => {
    const response = await Test.req
      .delete(`/v1/areas/${areas[0].id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
  });
});
