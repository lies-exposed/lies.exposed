import { vi } from "vitest";

export const igProviderMock = {
  ig: {} as any,
  postPhoto: vi.fn<() => void>(),
  postVideo: vi.fn<() => void>(),
  postAlbum: vi.fn<() => void>(),
  login: vi.fn<() => void>(),
};
