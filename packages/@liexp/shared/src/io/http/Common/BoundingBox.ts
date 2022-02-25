import * as t from "io-ts";

export const BoundingBoxIO = t.union(
  [t.tuple([t.number, t.number, t.number, t.number]), t.array(t.number)],
  "BoundingBoxIO"
);

export type BoundingBoxIO = t.TypeOf<typeof BoundingBoxIO>;
