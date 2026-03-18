import { describe, expect, it, vi } from "vitest";
import {
  decodeExifTag,
  toImgProcError,
  toErrorReader,
  MakeImgProcClient,
} from "./imgproc.provider.js";

describe("imgproc.provider", () => {
  describe("ImgProcError", () => {
    it("should have name ImgProcError", () => {
      const error = toImgProcError(new Error("Test"));
      expect(error.name).toBe("ImgProcError");
    });

    it("should have status 500", () => {
      const error = toImgProcError(new Error("Test"));
      expect(error.status).toBe(500);
    });
  });

  describe("decodeExifTag", () => {
    it("should return undefined for undefined tag", () => {
      const result = decodeExifTag(undefined);
      expect(result).toBeUndefined();
    });

    it("should return value if tag has value property", () => {
      const tag = { value: 42 } as any;
      const result = decodeExifTag(tag);
      expect(result).toBe(42);
    });

    it("should return undefined if tag has no value property", () => {
      const tag = { description: "test" } as any;
      const result = decodeExifTag(tag);
      expect(result).toBeUndefined();
    });

    it("should handle ExifReader.XmpTag", () => {
      const tag = { value: 100, description: "test" } as any;
      const result = decodeExifTag(tag);
      expect(result).toBe(100);
    });

    it("should handle TypedTag", () => {
      const tag = { value: 200 } as any;
      const result = decodeExifTag(tag);
      expect(result).toBe(200);
    });
  });

  describe("toImgProcError", () => {
    it("should convert Error to ImgProcError with message", () => {
      const error = new Error("Image processing failed");
      const result = toImgProcError(error);

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Image processing failed");
      expect(result.status).toBe(500);
    });

    it("should include stack trace in meta", () => {
      const error = new Error("Test error");
      const result = toImgProcError(error);

      expect((result.details as any).meta).toBeDefined();
    });

    it("should handle non-Error values", () => {
      const result = toImgProcError("Unknown error");

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Internal Error");
      expect(result.status).toBe(500);
    });

    it("should handle null value", () => {
      const result = toImgProcError(null);

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Internal Error");
    });

    it("should handle undefined value", () => {
      const result = toImgProcError(undefined);

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Internal Error");
    });

    it("should handle object value", () => {
      const result = toImgProcError({ code: "ERR_IMAGE" });

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Internal Error");
    });

    it("should handle number value", () => {
      const result = toImgProcError(123);

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Internal Error");
    });
  });

  describe("toErrorReader", () => {
    it("should return ImgProcError for Error", () => {
      const mockLogger = {
        error: { log: vi.fn() },
      } as any;

      const result = toErrorReader(mockLogger)(new Error("Test"));

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Test");
    });

    it("should log the error", () => {
      const mockLogger = {
        error: { log: vi.fn() },
      } as any;

      toErrorReader(mockLogger)(new Error("Test"));

      expect(mockLogger.error.log).toHaveBeenCalled();
    });

    it("should return ImgProcError for non-Error values", () => {
      const mockLogger = {
        error: { log: vi.fn() },
      } as any;

      const result = toErrorReader(mockLogger)("Unknown");

      expect(result.name).toBe("ImgProcError");
      expect(result.message).toBe("Internal Error");
    });
  });

  describe("MakeImgProcClient", () => {
    const createMockConfig = () => {
      const mockLogger = {
        error: { log: vi.fn() },
        debug: { log: vi.fn() },
      };
      const mockClient = vi.fn();
      const mockExifR = {
        load: vi.fn(),
      };

      return { mockLogger, mockClient, mockExifR };
    };

    describe("run", () => {
      it("should execute function with client", async () => {
        const { mockLogger, mockClient, mockExifR } = createMockConfig();
        mockClient.mockResolvedValue(Buffer.from("test"));
        const client = MakeImgProcClient({
          logger: mockLogger as any,
          client: mockClient as any,
          exifR: mockExifR as any,
        });

        const result = await client.run((_s) =>
          Promise.resolve(Buffer.from("result")),
        )();

        expect(result._tag).toBe("Right");
      });

      it("should return error when function throws", async () => {
        const { mockLogger, mockClient, mockExifR } = createMockConfig();
        const client = MakeImgProcClient({
          logger: mockLogger as any,
          client: mockClient as any,
          exifR: mockExifR as any,
        });

        const result = await client.run(() => {
          throw new Error("Processing failed");
        })();

        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left.name).toBe("ImgProcError");
        }
      });
    });

    describe("readExif", () => {
      it("should load exif data successfully", async () => {
        const { mockLogger, mockClient, mockExifR } = createMockConfig();
        const mockTags = { Make: { value: "Canon" } };
        mockExifR.load.mockResolvedValue(mockTags);

        const client = MakeImgProcClient({
          logger: mockLogger as any,
          client: mockClient as any,
          exifR: mockExifR as any,
        });

        const result = await client.readExif("test.jpg", {})();

        expect(result._tag).toBe("Right");
        if (result._tag === "Right") {
          expect(result.right).toEqual(mockTags);
        }
      });

      it("should return error when load fails", async () => {
        const { mockLogger, mockClient, mockExifR } = createMockConfig();
        mockExifR.load.mockRejectedValue(new Error("Invalid image"));

        const client = MakeImgProcClient({
          logger: mockLogger as any,
          client: mockClient as any,
          exifR: mockExifR as any,
        });

        const result = await client.readExif("invalid.jpg", {})();

        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left.name).toBe("ImgProcError");
        }
      });
    });
  });
});
