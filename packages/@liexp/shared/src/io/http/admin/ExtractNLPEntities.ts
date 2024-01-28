import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { URL } from "../Common/URL.js";
import { ResourcesNames } from "../ResourcesNames.js";

const ExtractEntitiesWithNLPFromURLInput = t.strict({ url: URL });
const ExtractEntitiesWithNLPFromTextInput = t.strict({ text: t.string });
export const ExtractEntitiesWithNLPFromResourceInput = t.strict({
  resource: ResourcesNames,
  uuid: UUID,
});
export type ExtractEntitiesWithNLPFromResourceInput = t.TypeOf<
  typeof ExtractEntitiesWithNLPFromResourceInput
>;

export const ExtractEntitiesWithNLPInput = t.union([
  ExtractEntitiesWithNLPFromURLInput,
  ExtractEntitiesWithNLPFromTextInput,
  ExtractEntitiesWithNLPFromResourceInput,
]);

export type ExtractEntitiesWithNLPInput = t.TypeOf<
  typeof ExtractEntitiesWithNLPInput
>;

export const ExtractEntitiesWithNLPOutput = t.strict({
  entities: t.strict({
    actors: t.array(t.any),
    groups: t.array(t.any),
    keywords: t.array(t.any),
  }),
  sentences: t.array(
    t.strict({
      text: t.string,
      importance: t.number,
    }),
  ),
});

export type ExtractEntitiesWithNLPOutput = t.TypeOf<
  typeof ExtractEntitiesWithNLPOutput
>;
