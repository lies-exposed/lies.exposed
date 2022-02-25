export const logInPipe =
  (key: string) =>
  <T>(result: T): T => {
    // eslint-disable-next-line no-console
    console.log(key, result);

    return result;
  };
