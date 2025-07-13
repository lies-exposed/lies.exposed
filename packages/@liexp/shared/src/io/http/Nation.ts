import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { UUID } from "./Common/UUID.js";
import { GetListQuery } from "./Query/GetListQuery.js";

export const GetListNationQuery = Schema.Struct({
  ...GetListQuery.fields,
  ids: OptionFromNullishToNull(Schema.NonEmptyArray(UUID)),
});
export type GetListNationQuery = typeof GetListNationQuery.Type;

export const CreateNationBody = Schema.Struct({
  name: Schema.String,
  isoCode: Schema.String,
}).annotations({
  title: "Nation",
});

export const Nation = Schema.Struct({
  ...BaseProps.fields,
  ...CreateNationBody.fields,
  actors: Schema.Array(UUID),
}).annotations({
  title: "Nation",
});

export type Nation = typeof Nation.Type;
