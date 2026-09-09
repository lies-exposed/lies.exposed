import { vi } from "vitest";

export const slateMock = {
  createExcerptValue: vi.fn(() => Promise.reject(new Error("Not implemented"))),
};
