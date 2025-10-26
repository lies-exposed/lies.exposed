import { PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { AdminDelete } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { PageArb } from "@liexp/test/lib/arbitrary/Page.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("DeleteManyPage route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("delete many pages happy path", async () => {
    const user = await saveUser(Test.ctx, [AdminDelete.literals[0]]);
    const { authorization } = await loginUser(Test)(user);

    const pages = fc.sample(PageArb, 2).map((p) => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await pipe(Test.ctx.db.save(PageEntity, pages), throwTE);

    const ids = pages.map((p) => p.id);

    const res = await Test.req
      .delete(`/v1/pages?${ids.map((id) => `ids=${id}`).join("&")}`)
      .set("Authorization", authorization);

    expect(res.status).toEqual(200);
  });
});
