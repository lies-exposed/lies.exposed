import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { type Area } from "@liexp/shared/lib/io/http/Area.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Get Area", () => {
  let Test: AppTest;
  let areas: Area[];
  let regularUserToken: string;
  let adminUserToken: string;
  let deletedArea: Area;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create regular user token
    const regularUser = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(regularUser);
    regularUserToken = authorization;

    const adminUser = await saveUser(Test.ctx, ["admin:read"]);
    const { authorization: adminAuthorization } =
      await loginUser(Test)(adminUser);
    adminUserToken = adminAuthorization;

    // Generate test areas
    areas = tests.fc.sample(AreaArb, 2);

    // Save regular areas
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

    // Create and save a soft-deleted area
    deletedArea = tests.fc.sample(AreaArb, 1)[0];
    await throwTE(
      Test.ctx.db.save(AreaEntity, [
        {
          ...deletedArea,
          media: [],
          events: [],
          socialPosts: [],
          featuredImage: null,
        },
      ]),
    );
    await throwTE(Test.ctx.db.softDelete(AreaEntity, deletedArea.id));
  });

  describe("Regular user", () => {
    test("Should return 200 and area data when getting an existing area", async () => {
      const response = await Test.req
        .get(`/v1/areas/${areas[0].id}`)
        .set("Authorization", regularUserToken);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toEqual(areas[0].id);
    });

    test("Should return 404 when getting a deleted area", async () => {
      const response = await Test.req
        .get(`/v1/areas/${deletedArea.id}`)
        .set("Authorization", regularUserToken);

      expect(response.status).toBe(404);
    });

    test("Should return 404 when getting a non-existent area", async () => {
      const response = await Test.req
        .get(`/v1/areas/${uuid()}`)
        .set("Authorization", regularUserToken);

      expect(response.status).toBe(404);
    });
  });

  describe("Admin user", () => {
    test("Should return 200 and area data when getting an existing area", async () => {
      const response = await Test.req
        .get(`/v1/areas/${areas[0].id}`)
        .set("Authorization", adminUserToken);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toEqual(areas[0].id);
    });

    test("Should return 200 when getting a deleted area", async () => {
      const response = await Test.req
        .get(`/v1/areas/${deletedArea.id}`)
        .set("Authorization", adminUserToken);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toEqual(deletedArea.id);
    });
  });

  describe("Unauthenticated user", () => {
    test("Should return 200 and area data when getting an existing area", async () => {
      const response = await Test.req.get(`/v1/areas/${areas[0].id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toEqual(areas[0].id);
    });

    test("Should return 404 when getting a deleted area", async () => {
      const response = await Test.req.get(`/v1/areas/${deletedArea.id}`);

      expect(response.status).toBe(404);
    });
  });
});
