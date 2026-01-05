import type fs from "fs";
import { vi } from "vitest";
import { type DeepMockProxy, mock } from "vitest-mock-extended";

export const fsMock: DeepMockProxy<typeof fs> = mock({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn().mockReturnValue(undefined),
  writeFileSync: vi.fn().mockReturnValue(undefined),
});
