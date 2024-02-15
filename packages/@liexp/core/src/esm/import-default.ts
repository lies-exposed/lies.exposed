// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const importDefault = <
  A extends { default: any } = { default: (...args: any[]) => any },
>(
  imp: any,
): { default: A["default"] } => {
  // eslint-disable-next-line no-console
  console.warn(`importing react-page component from ${typeof imp}!`);
  if (typeof imp === "function") {
    return { default: imp };
  }
  return (imp.default?.default ? imp.default : imp) as {
    default: A["default"];
  };
};
