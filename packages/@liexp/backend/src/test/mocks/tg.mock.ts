import { vi } from "vitest";

export const tgProviderMock = {
  api: {
    onText: vi.fn<() => void>(),
    getChat: vi.fn<() => void>(),
    downloadFile: vi.fn<() => void>(),
    getFileStream: vi.fn<() => void>(),
  } as any,
  getFileStream: vi.fn<() => void>(),
  startPolling: vi.fn<() => void>(),
  stopPolling: vi.fn<() => void>(),
  onMessage: vi.fn<() => void>(),
  post: vi.fn<() => void>(),
  postPhoto: vi.fn<() => void>(),
  postVideo: vi.fn<() => void>(),
  postFile: vi.fn<() => void>(),
  postMediaGroup: vi.fn<() => void>(),
  upsertPinnedMessage: vi.fn<() => void>(),
};
