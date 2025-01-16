import type sharp from "sharp";
import { vi } from "vitest";
import { type DeepMockProxy, mock } from "vitest-mock-extended";

export const sharpMock: DeepMockProxy<sharp.Sharp> = mock({
  keepExif: vi.fn().mockReturnThis(),
  rotate: vi.fn().mockReturnThis(),
  resize: vi.fn().mockReturnThis(),
  toFormat: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValueOnce(Buffer.from([])),
});

export default sharpMock as any as typeof sharp;
