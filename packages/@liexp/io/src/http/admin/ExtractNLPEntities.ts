import { Schema } from "effect";
import { URL } from "../Common/URL.js";
import { UUID } from "../Common/UUID.js";
import { ResourcesNames } from "../ResourcesNames.js";

const ExtractEntitiesWithNLPFromURLInput = Schema.Struct({ url: URL });
const ExtractEntitiesWithNLPFromPDFInput = Schema.Struct({ pdf: URL });
const ExtractEntitiesWithNLPFromTextInput = Schema.Struct({
  text: Schema.String,
});
export const ExtractEntitiesWithNLPFromResourceInput = Schema.Struct({
  resource: ResourcesNames,
  uuid: UUID,
});
export type ExtractEntitiesWithNLPFromResourceInput =
  typeof ExtractEntitiesWithNLPFromResourceInput.Type;

export const ExtractEntitiesWithNLPInput = Schema.Union(
  ExtractEntitiesWithNLPFromURLInput,
  ExtractEntitiesWithNLPFromPDFInput,
  ExtractEntitiesWithNLPFromTextInput,
  ExtractEntitiesWithNLPFromResourceInput,
).annotations({
  title: "ExtractEntitiesWithNLPInput",
});

export type ExtractEntitiesWithNLPInput =
  typeof ExtractEntitiesWithNLPInput.Type;

export const ExtractEntitiesWithNLPOutput = Schema.Struct({
  entities: Schema.Struct({
    actors: Schema.Array(Schema.Any),
    groups: Schema.Array(Schema.Any),
    keywords: Schema.Array(Schema.Any),
  }),
  sentences: Schema.Array(
    Schema.Struct({
      text: Schema.String,
      importance: Schema.Number,
    }),
  ),
});

export type ExtractEntitiesWithNLPOutput =
  typeof ExtractEntitiesWithNLPOutput.Type;
