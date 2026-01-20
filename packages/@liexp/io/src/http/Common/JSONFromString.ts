import { Schema } from "effect";

export const JSONFromString = Schema.parseJson().annotations({
  title: "JSONFromString",
});
