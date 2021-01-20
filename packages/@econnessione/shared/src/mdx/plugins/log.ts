export const log = (message: string) => () => (tree: any) =>
  // eslint-disable-next-line no-console
  console.log(message, JSON.stringify(tree, null, 2));
