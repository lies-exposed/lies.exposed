import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { AdminCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { getOneAdminOrFail } from "./getOneUserOrFail.flow.js";

type GetOneAdminContext = DatabaseContext;

describe(getOneAdminOrFail.name, () => {
  const appTest = {
    ctx: mockedContext<GetOneAdminContext>({
      db: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return an admin user with AdminCreate permission", async () => {
    const adminUser = new UserEntity();
    adminUser.id = uuid();
    adminUser.username = "admin";
    adminUser.email = "admin@test.com";
    adminUser.permissions = [AdminCreate.literals[0]];

    mockTERightOnce(appTest.ctx.db.execQuery, () => adminUser);

    const result = await pipe(getOneAdminOrFail(appTest.ctx), throwTE);

    expect(appTest.ctx.db.execQuery).toHaveBeenCalled();
    expect(result.id).toBe(adminUser.id);
    expect(result.username).toBe("admin");
  });

  it("should query for users with admin permissions", async () => {
    const adminUser = new UserEntity();
    adminUser.id = uuid();
    adminUser.permissions = [AdminCreate.literals[0]];

    appTest.ctx.db.execQuery.mockImplementationOnce(() => {
      return fp.TE.right(adminUser);
    });

    await pipe(getOneAdminOrFail(appTest.ctx), throwTE);

    expect(appTest.ctx.db.execQuery).toHaveBeenCalledWith(expect.any(Function));
  });
});
