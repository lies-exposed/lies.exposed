import { fc, getArbitrary } from "@econnessione/core/tests";
import * as t from "io-ts";
import { CreateKeyword } from "../../io/http/Keyword";
import { TagArb } from "./utils.arbitrary";

export const CreateKeywordArb = getArbitrary(
  t.strict({
    ...CreateKeyword.type.props,
  })
).map((k) => ({
  ...k,
  tag: fc.sample(TagArb(), 1)[0],
}));

export const KeywordArb = fc.record({
  id: fc.uuidV(4),
  tag: TagArb(),
});
