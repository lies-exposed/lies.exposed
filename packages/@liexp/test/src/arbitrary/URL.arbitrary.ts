import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { Schema } from "effect";
import fc from "fast-check";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";

export const URLArb = fc
  .record({
    protocol: fc.oneof(fc.constant("http"), fc.constant("https")),
    domain: HumanReadableStringArb({ joinChar: ".", count: 3 }),
    extension: fc.oneof(
      fc.constant("com"),
      fc.constant("org"),
      fc.constant("it"),
    ),
    segments: HumanReadableStringArb({ joinChar: "/", count: 3 }),
    query: fc.webQueryParameters(),
  })
  .map(({ protocol, domain, extension, segments, query }) =>
    Schema.decodeSync(URL)(
      `${protocol}://${domain.toLocaleLowerCase()}.${extension}/${segments}?${query}`,
    ),
  );
