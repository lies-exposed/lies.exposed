import type { Sharp, SharpInput } from "sharp";
import { vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

export type SharpInstanceMocks = MockProxy<Sharp> & Sharp;

export const sharpInstanceMocks: SharpInstanceMocks = mock<Sharp>({
  composite: vi.fn().mockReturnThis(),
  keepExif: vi.fn().mockReturnThis(),
  rotate: vi.fn().mockReturnThis(),
  resize: vi.fn().mockReturnThis(),
  sharpen: vi.fn().mockReturnThis(),
  toFormat: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValueOnce(Buffer.from([])),
});

export type SharpInitMock = (input?: SharpInput) => SharpInstanceMocks;

export const sharpInit: SharpInitMock = vi.fn(() => sharpInstanceMocks);

const sharpMock = { get: sharpInit, mocks: sharpInstanceMocks };

export default sharpMock;
