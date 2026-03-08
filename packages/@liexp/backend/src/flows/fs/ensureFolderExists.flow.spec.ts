import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { mockedContext } from "../../test/context.js";
import { ensureFolderExists } from "./ensureFolderExists.flow.js";

type EnsureFolderExistsContext = FSClientContext & LoggerContext;

describe(ensureFolderExists.name, () => {
  const appTest = {
    ctx: mockedContext<EnsureFolderExistsContext>({
      fs: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should succeed without creating directory when folder already exists", async () => {
    const filePath = "/tmp/existing-folder/file.txt";
    const mkdirSyncMock = vi.fn();

    appTest.ctx.fs._fs = {
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: mkdirSyncMock,
    } as any;

    const result = await pipe(
      ensureFolderExists(filePath)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.fs._fs.existsSync).toHaveBeenCalledWith(
      "/tmp/existing-folder",
    );
    expect(mkdirSyncMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should create directory recursively when folder does not exist", async () => {
    const filePath = "/tmp/new-folder/sub/file.txt";
    const mkdirSyncMock = vi.fn();

    appTest.ctx.fs._fs = {
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: mkdirSyncMock,
    } as any;

    const result = await pipe(
      ensureFolderExists(filePath)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.fs._fs.existsSync).toHaveBeenCalledWith(
      "/tmp/new-folder/sub",
    );
    expect(mkdirSyncMock).toHaveBeenCalledWith("/tmp/new-folder/sub", {
      recursive: true,
    });
    expect(result).toBeUndefined();
  });

  it("should return FSError when existsSync throws", async () => {
    const filePath = "/tmp/error-folder/file.txt";

    appTest.ctx.fs._fs = {
      existsSync: vi.fn().mockImplementation(() => {
        throw new Error("Permission denied");
      }),
      mkdirSync: vi.fn(),
    } as any;

    const either = await pipe(ensureFolderExists(filePath)(appTest.ctx))();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left.message).toBe("Permission denied");
    }
  });

  it("should return FSError when mkdirSync throws", async () => {
    const filePath = "/tmp/mkdir-error/file.txt";

    appTest.ctx.fs._fs = {
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: vi.fn().mockImplementation(() => {
        throw new Error("mkdir failed");
      }),
    } as any;

    const either = await pipe(ensureFolderExists(filePath)(appTest.ctx))();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left.message).toBe("mkdir failed");
    }
  });

  it("should use path.dirname to determine the folder path", async () => {
    const filePath = "/deep/nested/path/to/file.json";
    const existsSyncMock = vi.fn().mockReturnValue(true);

    appTest.ctx.fs._fs = {
      existsSync: existsSyncMock,
      mkdirSync: vi.fn(),
    } as any;

    await pipe(ensureFolderExists(filePath)(appTest.ctx), throwTE);

    expect(existsSyncMock).toHaveBeenCalledWith("/deep/nested/path/to");
  });
});
