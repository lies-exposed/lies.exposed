const createValue = jest
  .fn()
  .mockImplementation(() => ({ id: "fake-id", rows: [] }));

export { createValue };
