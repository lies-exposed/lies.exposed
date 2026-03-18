import { describe, expect, it, vi } from "vitest";
import { GetLocalSpaceProvider } from "./local-space.provider.js";

describe("local-space.provider", () => {
  const createMockContext = () => {
    const mockClient = {
      get: vi.fn(),
      defaults: {
        baseURL: "http://data.localhost",
      },
    };
    const mockLogger = {
      debug: { log: vi.fn() },
      extend: vi.fn(() => ({
        debug: { log: vi.fn() },
      })),
    };

    return { mockClient, mockLogger };
  };

  describe("getEndpoint", () => {
    it("should return an endpoint path", async () => {
      const { mockClient, mockLogger } = createMockContext();

      const provider = GetLocalSpaceProvider({
        client: mockClient as any,
        logger: mockLogger as any,
      });

      const result = await provider.getEndpoint("test-bucket")();

      expect(result._tag).toBe("Right");
    });
  });

  describe("getObject", () => {
    it("should return object data", async () => {
      const { mockClient, mockLogger } = createMockContext();
      mockClient.get.mockResolvedValue({
        data: { blob: vi.fn(() => Promise.resolve(Buffer.from("test"))) },
      });

      const provider = GetLocalSpaceProvider({
        client: mockClient as any,
        logger: mockLogger as any,
      });

      const result = await provider.getObject({
        Bucket: "test",
        Key: "file.txt",
      })();

      expect(result._tag).toBe("Right");
    });
  });

  describe("deleteObject", () => {
    it("should return success response", async () => {
      const { mockClient, mockLogger } = createMockContext();

      const provider = GetLocalSpaceProvider({
        client: mockClient as any,
        logger: mockLogger as any,
      });

      const result = await provider.deleteObject({
        Bucket: "test",
        Key: "file.txt",
      })();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.DeleteMarker).toBe(true);
      }
    });
  });

  describe("upload", () => {
    it("should return success response", async () => {
      const { mockClient, mockLogger } = createMockContext();

      const provider = GetLocalSpaceProvider({
        client: mockClient as any,
        logger: mockLogger as any,
      });

      const result = await provider.upload({
        Bucket: "test",
        Key: "file.txt",
      })();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.Location).toBe("");
      }
    });
  });

  describe("listObjects", () => {
    it("should return empty contents", async () => {
      const { mockClient, mockLogger } = createMockContext();

      const provider = GetLocalSpaceProvider({
        client: mockClient as any,
        logger: mockLogger as any,
      });

      const result = await provider.listObjects({ Bucket: "test" })();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.Contents).toEqual([]);
      }
    });
  });

  describe("getSignedUrl", () => {
    it("should return a signed URL", async () => {
      const { mockClient, mockLogger } = createMockContext();

      const provider = GetLocalSpaceProvider({
        client: mockClient as any,
        logger: mockLogger as any,
      });

      const result = await provider.getSignedUrl({
        Bucket: "test",
        Key: "file.txt",
      })();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toContain("localhost");
        expect(result.right).toContain("file.txt");
      }
    });
  });

  describe("createBucket", () => {
    it("should return bucket location", async () => {
      const { mockClient, mockLogger } = createMockContext();

      const provider = GetLocalSpaceProvider({
        client: mockClient as any,
        logger: mockLogger as any,
      });

      const result = await provider.createBucket({ Bucket: "test-bucket" })();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.Location).toBe("test-bucket");
      }
    });
  });
});
