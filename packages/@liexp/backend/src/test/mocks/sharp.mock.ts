import type sharp from "sharp";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

export const sharpInstanceMocks = mock<sharp.Sharp>({
  keepExif: vi.fn().mockReturnThis(),
  rotate: vi.fn().mockReturnThis(),
  resize: vi.fn().mockReturnThis(),
  toFormat: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValueOnce(Buffer.from([])),
});

export const sharpInit = (() => sharpInstanceMocks) as unknown as typeof sharp;

export default { get: sharpInit, mocks: sharpInstanceMocks };
