import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { option } from "io-ts-types/lib/option";

export interface OptionFromUndefinedC<C extends t.Mixed>
  extends t.Type<O.Option<t.TypeOf<C>>, t.OutputOf<C> | undefined, unknown> {}

export const optionFromUndefined = <C extends t.Mixed>(
  codec: C,
  name?: string
): OptionFromUndefinedC<C> => {
  if (name === undefined) {
    name = "Option<" + codec.name + ">";
  }
  return new t.Type(
    name,
    option(codec).is,
    function (u, c) {
      return u == null
        ? t.success(O.none)
        : pipe(codec.validate(u, c), E.map(O.some));
    },
    function (a) {
      return O.toUndefined(pipe(a, O.map(codec.encode)));
    }
  );
};
