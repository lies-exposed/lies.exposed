import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/function";

type OptionalsToUndefined<T extends { [key: string]: O.Option<any> }> = {
  [K in keyof T]: T[K] extends O.Some<infer A> ? A : undefined;
};

export const foldOptionals = <T extends Record<string, O.Option<any>>>(
  obj: T
): Record<string, any> =>
  pipe(
    obj,
    R.filter(O.isSome),
    R.map((v) => v.value)
  );

export const optionalsToUndefined = <
  T extends { [key: string]: O.Option<any> }
>(
  obj: T
): OptionalsToUndefined<T> =>
  pipe(obj, R.map(O.toUndefined)) as OptionalsToUndefined<T>;


type DefaultOptionals<T extends { [key: string]: O.Option<any> }> = {
  [K in keyof T]?: T[K] extends O.Option<infer A> ? A : never
}

export const defaultOptionals = <
  T extends { [key: string]: O.Option<any> },
  D extends DefaultOptionals<T>
>(
  optionals: T,
  defaults: D
): DefaultOptionals<T> =>
  pipe(
    optionals,
    R.mapWithIndex((index, v) => (O.isNone(v) ? defaults[index] : v.value))
  );
