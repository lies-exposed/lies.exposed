import { Tag } from "@liexp/shared/lib/io/http/Common/Tag.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { DateArb } from "./Date.arbitrary.js";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const TagArb = () =>
  Arbitrary.make(Tag).chain(() =>
    HumanReadableStringArb({ joinChar: "", count: 3 }).map((tag) =>
      tag.replace(/-/g, ""),
    ),
  );

export const CreateKeywordArb = fc.record({
  tag: TagArb(),
});

export const KeywordArb = fc.record({
  id: UUIDArb,
  tag: TagArb(),
  color: ColorArb,
  socialPosts: fc.constant([]),
  createdAt: DateArb,
  updatedAt: DateArb,
  deletedAt: fc.constant(undefined),
});
