import { Schema } from "effect";

export interface Output<T> {
  data: T;
}

export const Output = <T extends Schema.Schema.Any>(
  data: T,
): Schema.Struct<{ data: T }> =>
  Schema.Struct({
    data,
  });

export const ListOutput = <T extends Schema.Schema.Any>(
  data: T,
  name: string,
): Schema.Struct<{ data: Schema.Array$<T>; total: typeof Schema.Number }> =>
  Schema.Struct({
    data: Schema.Array(data),
    total: Schema.Number,
  }).annotations({ title: name });

export interface ListOutput<T> {
  data: T[];
  total: number;
}
