import { type Redis } from "ioredis";
import { vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

export const redisMock: MockProxy<Redis> = mock<Redis>({
  on: vi.fn().mockRejectedValue(new Error("Not implemented")),
  publish: vi.fn().mockRejectedValue(new Error("Not implemented")),
});
