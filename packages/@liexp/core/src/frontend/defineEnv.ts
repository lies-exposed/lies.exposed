import * as t from "io-ts";

export const defineEnv = <P extends t.Props>(
  fn: (io: typeof t) => P,
): t.ExactC<t.TypeC<P>> => {
  return t.strict<P>(fn(t), "AppEnv");
};
