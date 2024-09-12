import { fc } from "@liexp/test";
import { DateArb } from "./Date.arbitrary.js";
import { getRandomInt, name1 } from "./HumanReadableString.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const TagArb = (): fc.Arbitrary<string> => {
  const stringArb = fc.convertToNext(fc.string());
  return fc.convertFromNext({
    ...stringArb,
    shrink: stringArb.shrink,
    canShrinkWithoutContext: stringArb.canShrinkWithoutContext,
    filter: stringArb.filter,
    map: stringArb.map,
    chain: stringArb.chain,
    noBias: stringArb.noBias,
    noShrink: stringArb.noShrink,
    generate: (mrng, biasFactor) => {
      const firstWord = name1.map((n) => n.replace(/-+/gi, ""))[
        getRandomInt(0, name1.length)
      ];
      const secondWord = name1.map((n) => n.replace(/-+/gi, ""))[
        getRandomInt(0, name1.length)
      ];
      const v = new fc.NextValue(
        firstWord.concat(secondWord),
        undefined,
        undefined,
      );
      return v;
    },
  });
};

export const CreateKeywordArb = fc.record({
  tag: TagArb(),
});

export const KeywordArb = fc.record({
  id: UUIDArb,
  tag: TagArb() as fc.Arbitrary<any>,
  color: ColorArb,
  socialPosts: fc.constant([]),
  createdAt: DateArb,
  updatedAt: DateArb,
  deletedAt: fc.constant(undefined),
});
