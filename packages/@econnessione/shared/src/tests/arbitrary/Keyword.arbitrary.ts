import { fc, getArbitrary } from "@econnessione/core/tests";
import * as t from "io-ts";
import { CreateKeyword } from "../../io/http/Keyword";
import { getRandomInt, name1 } from "./HumanReadableString.arbitrary";

export const TagArb = (): fc.Arbitrary<string> => {
  const stringArb = fc.convertToNext(fc.string());
  return fc.convertFromNext({
    shrink: stringArb.shrink,
    canShrinkWithoutContext: stringArb.canShrinkWithoutContext,
    filter: stringArb.filter,
    map: stringArb.map,
    chain: stringArb.chain,
    noBias: stringArb.noBias,
    noShrink: stringArb.noShrink,
    generate: (mrng, biasFactor) => {
      const v = new fc.NextValue(
        name1.map((n) => n.replace(/-+/gi, ""))[getRandomInt(0, name1.length)],
        undefined,
        undefined
      );
      return v;
    },
  });
};

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
