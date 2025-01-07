import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

export const sharpMock = mock({
  keepExif: vi.fn().mockReturnThis(),
  rotate: vi.fn().mockReturnThis(),
  resize: vi.fn().mockReturnThis(),
  toFormat: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValueOnce(Buffer.from([])),
});

export default vi.fn(() => sharpMock);
