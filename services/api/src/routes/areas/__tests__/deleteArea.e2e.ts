import {
  AreaArb,
  type AreaArbType,
} from "@liexp/shared/lib/tests/arbitrary/Area.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { AreaEntity } from "#entities/Area.entity.js";

describe("Delete Area", () => {
  let Test: AppTest, areas: AreaArbType[], authorizationToken: string;
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
