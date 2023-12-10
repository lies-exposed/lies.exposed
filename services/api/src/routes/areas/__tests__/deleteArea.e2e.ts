import { type http } from "@liexp/shared/lib/io/index.js";
import { AreaArb } from "@liexp/shared/lib/tests/arbitrary/Area.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { AreaEntity } from "#entities/Area.entity.js";

describe("Delete Area", () => {
  let Test: AppTest, areas: http.Area.Area[], authorizationToken: string;
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
