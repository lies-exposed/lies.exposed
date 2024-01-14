export const tgProviderMock = {
  api: {
    onText: vi.fn(),
    getChat: vi.fn(),
    downloadFile: vi.fn(),
    getFileStream: vi.fn(),
  } as any,
  startPolling: vi.fn(),
  stopPolling: vi.fn(),
  onMessage: vi.fn(),
  post: vi.fn(),
  postPhoto: vi.fn(),
  postVideo: vi.fn(),
  postFile: vi.fn(),
  postMediaGroup: vi.fn(),
  upsertPinnedMessage: vi.fn(),
};
