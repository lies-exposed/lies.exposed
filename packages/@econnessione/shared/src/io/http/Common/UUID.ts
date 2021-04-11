import * as t from "io-ts";
// import { validate } from "uuid";

export const UUID = t.brand(
  t.string,
  (s): s is t.Branded<string, { readonly UUID: symbol }> => true,
  "UUID"
);

export type UUID = t.TypeOf<typeof UUID>;
