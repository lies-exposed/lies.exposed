import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { Option, Some } from 'fp-ts/Option';

type OptionalsToUndefined<T extends Record<string, Option<any>>> = {
  [K in keyof T]: T[K] extends Some<infer A> ? A : undefined;
};

export const foldOptionals = <T extends Record<string, Option<any>>>(
  obj: T,
): { [K in keyof T]: T[K] extends Option<infer A> ? A : never } =>
  pipe(
    obj,
    fp.R.filter(fp.O.isSome),
    fp.R.map((v) => v.value),
  ) as any;

export const optionalsToUndefined = <T extends Record<string, Option<any>>>(
  obj: T,
): OptionalsToUndefined<T> =>
  pipe(obj, fp.R.map(fp.O.toUndefined)) as any;

type DefaultOptionals<T extends Record<string, Option<any>>> = {
  [K in keyof T]?: T[K] extends Option<infer A> ? A : never;
};

export const defaultOptionals = <
  T extends Record<string, Option<any>>,
  D extends DefaultOptionals<T>,
>(
  optionals: T,
  defaults: D,
): DefaultOptionals<T> =>
  pipe(
    optionals,
    fp.R.mapWithIndex((index, v) => (fp.O.isNone(v) ? defaults[index] : v.value)),
  );
