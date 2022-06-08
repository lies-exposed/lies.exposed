export const uploadPromise = jest.fn().mockResolvedValue(undefined);
export const getObjectPromise = jest.fn().mockResolvedValue(undefined);

export const awsMock = {
  getObject: jest.fn().mockResolvedValue(undefined),
  upload: () => ({ promise: uploadPromise }),
  createBucket: jest.fn().mockResolvedValue(undefined),
  deleteObject: () => ({ promise: getObjectPromise }),
  getSignedUrlPromise: jest.fn().mockRejectedValueOnce(undefined),
};
