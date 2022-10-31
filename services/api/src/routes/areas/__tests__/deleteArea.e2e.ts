import { http } from "@liexp/shared/io";
import { AreaArb } from "@liexp/shared/tests/arbitrary/Area.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as tests from "@liexp/test";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { AreaEntity } from "@entities/Area.entity";

describe("Delete Area", () => {
  let Test: AppTest, areas: http.Area.Area[], authorizationToken: string;
  beforeAll(async () => {
    Test = await initAppTest();

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
        }))
      )
    );
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.close());
  });

  test("Should return a 200", async () => {
    const response = await Test.req
      .delete(`/v1/areas/${areas[0].id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
  });
});
