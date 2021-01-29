import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";

export const foldOptionals = <T extends Record<string, O.Option<any>>>(
  obj: T
): Record<string, any> =>
  pipe(
    obj,
    R.filter(O.isSome),
    R.map((v) => v.value)
  );
