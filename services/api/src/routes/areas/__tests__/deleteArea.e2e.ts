import * as tests from "@econnessione/core/tests";
import { http } from "@econnessione/shared/io";
import { AreaArb } from "@econnessione/shared/tests/arbitrary/Area.arbitrary";
import { AreaEntity } from "@entities/Area.entity";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("Delete Area", () => {
  let Test: AppTest, areas: http.Area.Area[], authorizationToken: string;
  beforeAll(async () => {
    Test = await initAppTest();

    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    areas = tests.fc.sample(AreaArb, 1);
    await Test.ctx.db.save(AreaEntity, areas)();
  });

  afterAll(async () => {
    await Test.ctx.db.close()();
  });

  test("Should return a 200", async () => {
    const response = await Test.req
      .delete(`/v1/areas/${areas[0].id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
  });
});
