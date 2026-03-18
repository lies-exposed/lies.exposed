import { describe, expect, it, vi } from "vitest";
import { FSError, GetFSClient, toFSError } from "./fs.provider.js";

describe("fs.provider", () => {
  describe("toFSError", () => {
    it("should convert Error to FSError with message", () => {
      const error = new Error("File not found");
      const result = toFSError(error);

      expect(result).toBeInstanceOf(FSError);
      expect(result.name).toBe("FSError");
      expect(result.message).toBe("File not found");
    });

    it("should handle non-Error values", () => {
      const result = toFSError("Connection refused");

      expect(result).toBeInstanceOf(FSError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle null value", () => {
      const result = toFSError(null);

      expect(result).toBeInstanceOf(FSError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle undefined value", () => {
      const result = toFSError(undefined);

      expect(result).toBeInstanceOf(FSError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle object value", () => {
      const result = toFSError({ code: "ENOENT" });

      expect(result).toBeInstanceOf(FSError);
      expect(result.message).toBe("Internal Error");
    });
  });

  describe("GetFSClient", () => {
    const createMockFs = () => {
      const existsSync = vi.fn();
      const mkdirSync = vi.fn();
      const readFileSync = vi.fn();
      const writeFileSync = vi.fn();
      const rmSync = vi.fn();

      const mockFs = {
        existsSync,
        mkdirSync,
        readFileSync,
        writeFileSync,
        rmSync,
      };

      return {
        mockFs,
        existsSync,
        mkdirSync,
        readFileSync,
        writeFileSync,
        rmSync,
      };
    };

    describe("resolve", () => {
      it("should resolve path relative to cwd", () => {
        const { mockFs } = createMockFs();
        const client = GetFSClient({ client: mockFs as any });

        const result = client.resolve("./test.txt");
        expect(result).toContain("test.txt");
      });
    });

    describe("objectExists", () => {
      it("should return true if file exists", async () => {
        const { mockFs, existsSync } = createMockFs();
        existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.objectExists("/path/to/file.txt")();

        expect(result._tag).toBe("Right");
        if (result._tag === "Right") {
          expect(result.right).toBe(true);
        }
      });

      it("should return false if file does not exist", async () => {
        const { mockFs, existsSync } = createMockFs();
        existsSync.mockReturnValue(false);
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.objectExists("/path/to/file.txt")();

        expect(result._tag).toBe("Right");
        if (result._tag === "Right") {
          expect(result.right).toBe(false);
        }
      });

      it("should create directory if it does not exist", async () => {
        const { mockFs, existsSync, mkdirSync } = createMockFs();
        existsSync.mockReturnValue(false);
        const client = GetFSClient({ client: mockFs as any });

        await client.objectExists("/new/path/file.txt")();

        expect(mkdirSync).toHaveBeenCalledWith("/new/path", {
          recursive: true,
        });
      });
    });

    describe("getObject", () => {
      it("should return file content on success", async () => {
        const { mockFs, readFileSync } = createMockFs();
        readFileSync.mockReturnValue("file content");
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.getObject("/path/to/file.txt")();

        expect(result._tag).toBe("Right");
        if (result._tag === "Right") {
          expect(result.right).toBe("file content");
        }
      });

      it("should return error when file read fails", async () => {
        const { mockFs, readFileSync } = createMockFs();
        readFileSync.mockImplementation(() => {
          throw new Error("ENOENT: no such file");
        });
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.getObject("/nonexistent/file.txt")();

        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(FSError);
        }
      });
    });

    describe("writeObject", () => {
      it("should write data to file", async () => {
        const { mockFs, writeFileSync } = createMockFs();
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.writeObject(
          "/path/to/file.txt",
          "test data",
        )();

        expect(result._tag).toBe("Right");
        expect(writeFileSync).toHaveBeenCalledWith(
          "/path/to/file.txt",
          "test data",
          "utf-8",
        );
      });

      it("should return error when write fails", async () => {
        const { mockFs, writeFileSync } = createMockFs();
        writeFileSync.mockImplementation(() => {
          throw new Error("EACCES: permission denied");
        });
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.writeObject(
          "/path/to/file.txt",
          "test data",
        )();

        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(FSError);
        }
      });
    });

    describe("deleteObject", () => {
      it("should delete file when it exists", async () => {
        const { mockFs, existsSync, rmSync } = createMockFs();
        existsSync.mockReturnValue(true);
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.deleteObject("/path/to/file.txt")();

        expect(result._tag).toBe("Right");
        expect(rmSync).toHaveBeenCalledWith("/path/to/file.txt");
      });

      it("should return undefined when file does not exist and throwIfNoExists is false", async () => {
        const { mockFs, existsSync } = createMockFs();
        existsSync.mockReturnValue(false);
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.deleteObject("/path/to/file.txt")();

        expect(result._tag).toBe("Right");
        if (result._tag === "Right") {
          expect(result.right).toBeUndefined();
        }
      });

      it("should return error when file does not exist and throwIfNoExists is true", async () => {
        const { mockFs, existsSync } = createMockFs();
        existsSync.mockReturnValue(false);
        const client = GetFSClient({ client: mockFs as any });

        const result = await client.deleteObject("/path/to/file.txt", true)();

        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(FSError);
          expect(result.left.message).toContain("don't exists");
        }
      });
    });
  });
});
