import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";
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
    ) as any,
  );
