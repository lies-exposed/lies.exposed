import * as http from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";

export const PageArb: fc.Arbitrary<http.Page.Page> = Arbitrary.make(
  http.Page.Page,
).map((p) => ({
  ...p,
  path: fc
    .sample(HumanReadableStringArb({ count: 5 }), 1)
    .reduce((acc, s) => acc.concat(s), ""),
  title: fc
    .sample(HumanReadableStringArb({ count: 10 }), 1)
    .reduce((acc, s) => acc.concat(s), ""),
  excerpt: toInitialValue(
    fc
      .sample(HumanReadableStringArb({ count: 40 }))
      .reduce((acc, s) => acc.concat(s), ""),
  ),
  body2: toInitialValue(
    fc
      .sample(HumanReadableStringArb({ count: 100 }))
      .reduce((acc, s) => acc.concat(s), ""),
  ),
  deletedAt: undefined,
}));
