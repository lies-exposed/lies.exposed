import { vi } from "vitest";

export const igProviderMock = {
  ig: {} as any,
  postPhoto: vi.fn(),
  postVideo: vi.fn(),
  postAlbum: vi.fn(),
  login: vi.fn(),
};
