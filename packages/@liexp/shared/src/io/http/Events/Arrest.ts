import { Schema } from "effect";
import { BaseProps } from "../Common/BaseProps.js";
import { BySubjectId } from "../Common/BySubject.js";
import { For } from "../Common/For.js";

export const Arrest = Schema.Struct({
  ...BaseProps.fields,
  title: Schema.String,
  type: Schema.Literal("Arrest"),
  who: BySubjectId,
  for: Schema.Array(For),
  date: Schema.Date,
}).annotations({
  title: "Arrest",
});

export type Arrest = typeof Arrest.Type;
