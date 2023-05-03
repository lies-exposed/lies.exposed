export const tgProviderMock = {
  bot: {
    command: jest.fn(),
    api: {
      getChat: jest.fn(),
      downloadFile: jest.fn(),
    } as any,
  },
  startPolling: jest.fn(),
  stopPolling: jest.fn(),
  onMessage: jest.fn(),
  post: jest.fn(),
  postPhoto: jest.fn(),
  postMediaGroup: jest.fn(),
  upsertPinnedMessage: jest.fn(),
};
