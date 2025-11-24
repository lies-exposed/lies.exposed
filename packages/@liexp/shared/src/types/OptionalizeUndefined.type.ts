// Helper type: make properties optional when their type includes `undefined`.
// For each key K in T:
// - if T[K] includes `undefined`, the resulting type has `K?: Exclude<T[K], undefined>`
// - otherwise, it keeps `K: T[K]`.
export type OptionalizeUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
    T[K],
    undefined
  >;
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} extends infer O
  ? { [K in keyof O]: O[K] }
  : never;
