import { vi } from "vitest";

export const wikipediaProviderMock = {
  search: vi.fn(() => undefined),
  articleSummary: vi.fn(() => undefined),
};
