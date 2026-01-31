import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { subHours } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { mockedContext } from "../../test/context.js";
import { olderThan } from "./olderThan.flow.js";

type OlderThanContext = FSClientContext & LoggerContext;

describe(olderThan.name, () => {
  const appTest = {
    ctx: mockedContext<OlderThanContext>({
      fs: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 'older' when file is older than specified hours", async () => {
    const filePath = "/tmp/old-file.txt";
    const hours = 24;

    const oldDate = subHours(new Date(), 48); // 48 hours ago

    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(true));
    appTest.ctx.fs._fs = {
      statSync: vi.fn().mockReturnValue({ mtime: oldDate }),
    } as any;

    const result = await pipe(olderThan(filePath, hours)(appTest.ctx), throwTE);

    expect(appTest.ctx.fs.objectExists).toHaveBeenCalledWith(filePath);
    expect(result).toBe("older");
  });

  it("should return 'valid' when file is newer than specified hours", async () => {
    const filePath = "/tmp/new-file.txt";
    const hours = 24;

    const recentDate = subHours(new Date(), 2); // 2 hours ago

    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(true));
    appTest.ctx.fs._fs = {
      statSync: vi.fn().mockReturnValue({ mtime: recentDate }),
    } as any;

    const result = await pipe(olderThan(filePath, hours)(appTest.ctx), throwTE);

    expect(result).toBe("valid");
  });

  it("should return 'not-found' when file does not exist", async () => {
    const filePath = "/tmp/nonexistent-file.txt";
    const hours = 24;

    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(false));

    const result = await pipe(olderThan(filePath, hours)(appTest.ctx), throwTE);

    expect(result).toBe("not-found");
  });

  it("should return 'older' when file is exactly at the threshold", async () => {
    const filePath = "/tmp/threshold-file.txt";
    const hours = 12;

    const exactThresholdDate = subHours(new Date(), 12);

    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(true));
    appTest.ctx.fs._fs = {
      statSync: vi.fn().mockReturnValue({ mtime: exactThresholdDate }),
    } as any;

    const result = await pipe(olderThan(filePath, hours)(appTest.ctx), throwTE);

    expect(result).toBe("older");
  });
});
