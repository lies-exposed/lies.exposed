import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { subHours } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { FSError } from "../../providers/fs/fs.provider.js";
import { mockedContext } from "../../test/context.js";
import { getOlderThanOr } from "./getOlderThanOr.flow.js";

type GetOlderThanOrContext = FSClientContext & LoggerContext;

describe("getOlderThanOr", () => {
  const appTest = {
    ctx: mockedContext<GetOlderThanOrContext>({
      fs: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return cached content from file when file is valid (not older)", async () => {
    const fileName = "/tmp/cache.json";
    const hours = 24;
    const cachedData = { foo: "bar" };

    // File exists and is recent (2 hours ago → "valid")
    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(true));
    appTest.ctx.fs._fs = {
      statSync: vi.fn().mockReturnValue({ mtime: subHours(new Date(), 2) }),
    } as any;
    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.right(JSON.stringify(cachedData)),
    );

    const rte = fp.RTE.right<GetOlderThanOrContext, Error, typeof cachedData>({
      different: "data",
    } as any);

    const result = await pipe(
      getOlderThanOr(fileName, hours)(rte)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.fs.objectExists).toHaveBeenCalledWith(fileName);
    expect(appTest.ctx.fs.getObject).toHaveBeenCalledWith(fileName);
    expect(result).toEqual(cachedData);
  });

  it("should execute RTE and write result to file when file is not found", async () => {
    const fileName = "/tmp/missing-cache.json";
    const hours = 24;
    const freshData = { result: "fresh" };

    // File does not exist → "not-found"
    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(false));
    appTest.ctx.fs.writeObject.mockReturnValueOnce(fp.TE.right(undefined));

    const rte = fp.RTE.right<GetOlderThanOrContext, Error, typeof freshData>(
      freshData,
    );

    const result = await pipe(
      getOlderThanOr(fileName, hours)(rte)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.fs.writeObject).toHaveBeenCalledWith(
      fileName,
      JSON.stringify(freshData),
    );
    expect(result).toEqual(freshData);
  });

  it("should execute RTE and write result to file when file is older than threshold", async () => {
    const fileName = "/tmp/old-cache.json";
    const hours = 12;
    const freshData = { updated: true };

    // File exists but is 48 hours old → "older"
    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(true));
    appTest.ctx.fs._fs = {
      statSync: vi.fn().mockReturnValue({ mtime: subHours(new Date(), 48) }),
    } as any;
    appTest.ctx.fs.writeObject.mockReturnValueOnce(fp.TE.right(undefined));

    const rte = fp.RTE.right<GetOlderThanOrContext, Error, typeof freshData>(
      freshData,
    );

    const result = await pipe(
      getOlderThanOr(fileName, hours)(rte)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.fs.writeObject).toHaveBeenCalledWith(
      fileName,
      JSON.stringify(freshData),
    );
    expect(result).toEqual(freshData);
  });

  it("should use 24 hours as default threshold when hours is not provided", async () => {
    const fileName = "/tmp/default-hours-cache.json";
    const freshData = { default: true };

    // File does not exist → "not-found"
    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(false));
    appTest.ctx.fs.writeObject.mockReturnValueOnce(fp.TE.right(undefined));

    const rte = fp.RTE.right<GetOlderThanOrContext, Error, typeof freshData>(
      freshData,
    );

    // No hours argument — should default to 24
    const result = await pipe(
      getOlderThanOr(fileName)(rte)(appTest.ctx),
      throwTE,
    );

    expect(result).toEqual(freshData);
  });

  it("should propagate error when RTE fails", async () => {
    const fileName = "/tmp/error-cache.json";
    const hours = 24;

    // File does not exist → "not-found", so RTE is executed
    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(false));

    const expectedError = new Error("RTE failed");
    const rte = fp.RTE.left<GetOlderThanOrContext, Error, void>(expectedError);

    const either = await pipe(
      getOlderThanOr(fileName, hours)(rte)(appTest.ctx),
    )();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left).toBe(expectedError);
    }
  });

  it("should propagate error when getObject fails on valid cache", async () => {
    const fileName = "/tmp/read-error-cache.json";
    const hours = 24;

    // File exists and is recent (valid)
    appTest.ctx.fs.objectExists.mockReturnValueOnce(fp.TE.right(true));
    appTest.ctx.fs._fs = {
      statSync: vi.fn().mockReturnValue({ mtime: subHours(new Date(), 1) }),
    } as any;
    appTest.ctx.fs.getObject.mockReturnValueOnce(
      fp.TE.left(
        new FSError("Read error", {
          kind: "ServerError",
          status: "500",
          meta: [],
        }),
      ),
    );

    const rte = fp.RTE.right<GetOlderThanOrContext, Error, void>(undefined);

    const either = await pipe(
      getOlderThanOr(fileName, hours)(rte)(appTest.ctx),
    )();

    expect(fp.E.isLeft(either)).toBe(true);
  });
});
