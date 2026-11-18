import type sharp from "sharp";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

export const sharpInstanceMocks = mock<{
  composite: (...args: unknown[]) => unknown;
  keepExif: (...args: unknown[]) => unknown;
  rotate: (...args: unknown[]) => unknown;
  resize: (...args: unknown[]) => unknown;
  sharpen: (...args: unknown[]) => unknown;
  toFormat: (...args: unknown[]) => unknown;
  toBuffer: (...args: unknown[]) => Promise<Buffer>;
}>({
  composite: vi.fn().mockReturnThis(),
  keepExif: vi.fn().mockReturnThis(),
  rotate: vi.fn().mockReturnThis(),
  resize: vi.fn().mockReturnThis(),
  sharpen: vi.fn().mockReturnThis(),
  toFormat: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValueOnce(Buffer.from([])),
});

export const sharpInit = (() => sharpInstanceMocks) as unknown as typeof sharp;

export default { get: sharpInit, mocks: sharpInstanceMocks };
