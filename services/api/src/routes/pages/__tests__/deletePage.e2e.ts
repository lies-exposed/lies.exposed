import { PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import {
  AdminDelete,
  AdminRead,
} from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { PageArb } from "@liexp/test/lib/arbitrary/Page.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("DeletePage route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("admin with read permissions should not delete page", async () => {
    const user = await saveUser(Test.ctx, [AdminRead.literals[0]]);
    const { authorization } = await loginUser(Test)(user);

    const [payload] = fc.sample(PageArb, 1);

    await Test.req
      .post("/v1/pages")
      .set("Authorization", authorization)
      .send(payload)
      .expect(401);
  });

  test("delete page happy path", async () => {
    const user = await saveUser(Test.ctx, [AdminDelete.literals[0]]);
    const { authorization } = await loginUser(Test)(user);

    const [payload] = fc.sample(PageArb, 1);

    await pipe(
      Test.ctx.db.save(PageEntity, [
        { ...payload, createdAt: new Date(), updatedAt: new Date() },
      ]),
      throwTE,
    );

    const delRes = await Test.req
      .delete(`/v1/pages/${payload.id}`)
      .set("Authorization", authorization);

    expect(delRes.status).toEqual(200);
  });
});
