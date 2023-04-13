import * as t from "io-ts";

export interface Output<T> {
  data: T;
}

export const Output = <T extends t.Any>(
  data: T,
  name: string
): t.ExactType<t.TypeC<{ data: T }>> =>
  t.strict(
    {
      data,
    },
    name
  );

export const ListOutput = <T extends t.Any>(
  data: T,
  name: string
): t.ExactType<t.TypeC<{ data: t.ArrayC<T>; total: t.NumberC }>> =>
  t.strict(
    {
      data: t.array(data),
      total: t.number,
    },
    name
  );

export interface ListOutput<T> {
  data: T[];
  total: number;
}
