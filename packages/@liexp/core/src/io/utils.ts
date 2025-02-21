import * as O from "fp-ts/lib/Option.js";
import * as R from "fp-ts/lib/Record.js";
import { pipe } from "fp-ts/lib/function.js";
import type * as t from "io-ts";

export const propsOmit = <P extends t.Props, PP extends (keyof P)[]>(
  codec: t.ExactC<t.TypeC<P>>,
  props: PP,
): Omit<P, PP[number]> =>
  pipe(
    codec.type.props,
    R.filterMapWithIndex((k, p) =>
      pipe(
        p,
        O.fromPredicate(() => !props.includes(k)),
      ),
    ),
  ) as Omit<P, PP[number]>;
