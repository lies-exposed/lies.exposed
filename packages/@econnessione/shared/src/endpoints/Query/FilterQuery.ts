import * as t from 'io-ts';
import { BigIntFromString, DateFromISOString, optionFromNullable } from 'io-ts-types';

export const FilterQuery = t.record(
  t.string,
  optionFromNullable(t.union([t.number, t.string, DateFromISOString, BigIntFromString])),
  'FilterQuery'
);
export type FilterQuery = t.TypeOf<typeof FilterQuery>;
