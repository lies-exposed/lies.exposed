import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { AdminCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type TGBotProviderContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { findUserOrReplyFlow } from "./findUserOrReply.flow.js";

type FindUserOrReplyContext = LoggerContext &
  DatabaseContext &
  TGBotProviderContext;

describe(findUserOrReplyFlow.name, () => {
  const mockTg = mockDeep<TGBotProviderContext["tg"]>();

  const appTest = {
    ctx: mockedContext<FindUserOrReplyContext>({
      db: mockDeep(),
      tg: mockTg,
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute task when user is found by telegram id", async () => {
    const telegramId = 123456789;
    const chatId = 987654321;

    const user = new UserEntity();
    user.id = uuid();
    user.username = "testuser";
    user.telegramId = telegramId.toString();
    user.permissions = [AdminCreate.literals[0]];

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => user);

    let taskExecuted = false;
    const task = (u: UserEntity) => {
      taskExecuted = true;
      expect(u.id).toBe(user.id);
      return fp.TE.right(undefined);
    };

    await pipe(
      findUserOrReplyFlow(appTest.ctx)(task)(chatId, telegramId),
      throwTE,
    );

    expect(taskExecuted).toBe(true);
  });

  it("should send message and not execute task when user not found", async () => {
    const telegramId = 999999999;
    const chatId = 123123123;

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => null);

    mockTg.api.sendMessage.mockResolvedValueOnce({} as any);

    let taskExecuted = false;
    const task = (_u: UserEntity) => {
      taskExecuted = true;
      return fp.TE.right(undefined);
    };

    await pipe(
      findUserOrReplyFlow(appTest.ctx)(task)(chatId, telegramId),
      throwTE,
    );

    expect(taskExecuted).toBe(false);
    expect(mockTg.api.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining("not allowed"),
    );
  });

  it("should return None when no userId is provided", async () => {
    const chatId = 111111111;

    mockTg.api.sendMessage.mockResolvedValueOnce({} as any);

    let taskExecuted = false;
    const task = (_u: UserEntity) => {
      taskExecuted = true;
      return fp.TE.right(undefined);
    };

    await pipe(
      findUserOrReplyFlow(appTest.ctx)(task)(chatId, undefined),
      throwTE,
    );

    expect(taskExecuted).toBe(false);
    expect(mockTg.api.sendMessage).toHaveBeenCalled();
  });
});
