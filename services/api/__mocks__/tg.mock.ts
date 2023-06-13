export const tgProviderMock = {
  bot: {
    command: vi.fn(),
    api: {
      getChat: vi.fn(),
      downloadFile: vi.fn(),
    } as any,
  },
  startPolling: vi.fn(),
  stopPolling: vi.fn(),
  onMessage: vi.fn(),
  post: vi.fn(),
  postPhoto: vi.fn(),
  postMediaGroup: vi.fn(),
  upsertPinnedMessage: vi.fn(),
};
