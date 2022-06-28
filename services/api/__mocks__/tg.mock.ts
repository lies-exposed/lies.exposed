export const tgProviderMock = {
  bot: {
    downloadFile: jest.fn()
  } as any,
  startPolling: jest.fn(),
  stopPolling: jest.fn(),
  onMessage: jest.fn(),
  post: jest.fn(),
  postPhoto: jest.fn()
};
