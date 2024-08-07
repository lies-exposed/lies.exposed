import { mock } from "vitest-mock-extended";

export const sharpMock = mock({
  keepExif: vitest.fn().mockReturnThis(),
  rotate: vitest.fn().mockReturnThis(),
  resize: vitest.fn().mockReturnThis(),
  toFormat: vitest.fn().mockReturnThis(),
  toBuffer: vitest.fn().mockResolvedValueOnce(Buffer.from([])),
});

export default vitest.fn(() => sharpMock);
