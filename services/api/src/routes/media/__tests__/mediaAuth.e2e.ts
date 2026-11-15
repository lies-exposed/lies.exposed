import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Media write routes authentication", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("DELETE /v1/media/:id without token returns 401", async () => {
    const res = await Test.req.delete(`/v1/media/${uuid()}`);
    expect(res.status).toEqual(401);
  });

  test("PUT /v1/media/:id without token returns 401", async () => {
    const res = await Test.req.put(`/v1/media/${uuid()}`).send({});
    expect(res.status).toEqual(401);
  });

  test("POST /v1/media/:id/thumbnails without token returns 401", async () => {
    const res = await Test.req.post(`/v1/media/${uuid()}/thumbnails`);
    expect(res.status).toEqual(401);
  });

  test("DELETE /v1/media/:id with a read-only user returns 401", async () => {
    const user = await saveUser(Test.ctx, ["admin:read"]);
    const { authorization } = await loginUser(Test)(user);
    const res = await Test.req
      .delete(`/v1/media/${uuid()}`)
      .set("Authorization", authorization);
    expect(res.status).toEqual(401);
  });
});
