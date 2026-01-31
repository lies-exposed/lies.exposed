import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { AdminCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { getUserByTelegramId } from "./getUserByTelegramId.flow.js";

type GetUserByTelegramIdContext = LoggerContext & DatabaseContext;

describe(getUserByTelegramId.name, () => {
  const appTest = {
    ctx: mockedContext<GetUserByTelegramIdContext>({
      db: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return Some(user) when user is found by telegram id", async () => {
    const telegramId = "123456789";

    const user = new UserEntity();
    user.id = uuid();
    user.username = "telegramuser";
    user.telegramId = telegramId;
    user.permissions = [AdminCreate.literals[0]];

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => user);

    const result = await pipe(
      getUserByTelegramId(telegramId)(appTest.ctx),
      throwTE,
    );

    expect(fp.O.isSome(result)).toBe(true);

    if (fp.O.isSome(result)) {
      expect(result.value.id).toBe(user.id);
      expect(result.value.telegramId).toBe(telegramId);
    }
  });

  it("should accept numeric telegram id", async () => {
    const telegramId = 987654321;

    const user = new UserEntity();
    user.id = uuid();
    user.telegramId = telegramId.toString();
    user.permissions = [AdminCreate.literals[0]];

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => user);

    const result = await pipe(
      getUserByTelegramId(telegramId)(appTest.ctx),
      throwTE,
    );

    expect(fp.O.isSome(result)).toBe(true);
  });

  it("should return Some with null when user is not found", async () => {
    const telegramId = "nonexistent";

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => null);

    const result = await pipe(
      getUserByTelegramId(telegramId)(appTest.ctx),
      throwTE,
    );

    expect(fp.O.isNone(result)).toBe(true);
  });
});
