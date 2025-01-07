import { vi } from "vitest";

export const wikipediaProviderMock = {
  bot: {} as any,
  search: vi.fn(),
  parse: vi.fn(),
  article: vi.fn(),
  articleInfo: vi.fn(),
  articleSummary: vi.fn(),
  articleFeaturedImage: vi.fn(),
};
