const createValue = vi
  .fn()
  .mockImplementation(() => ({ id: "fake-id", rows: [] }));

export { createValue };
