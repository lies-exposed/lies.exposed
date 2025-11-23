import { PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { AdminEdit } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { PageArb } from "@liexp/test/lib/arbitrary/Page.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("EditPage route", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("edit page happy path", async () => {
    const user = await saveUser(Test.ctx, [AdminEdit.literals[0]]);
    const { authorization } = await loginUser(Test)(user);

    const payload = fc.sample(PageArb, 1)[0];

    await pipe(
      Test.ctx.db.save(PageEntity, [
        { ...payload, createdAt: new Date(), updatedAt: new Date() },
      ]),
      throwTE,
    );

    const editRes = await Test.req
      .put(`/v1/pages/${payload.id}`)
      .set("Authorization", authorization)
      .send({ ...payload, title: "edited" });

    expect(editRes.status).toEqual(200);
    expect(editRes.body.data).toMatchObject({
      id: payload.id,
      title: "edited",
    });
  });
});
