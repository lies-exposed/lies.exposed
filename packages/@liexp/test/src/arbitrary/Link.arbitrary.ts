import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import fc from "fast-check";
import { getArbitrary } from "fast-check-io-ts";
import * as t from "io-ts";
import { DateArb } from "./Date.arbitrary.js";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { MediaArb } from "./Media.arbitrary.js";
import { URLArb } from "./URL.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const linksProps = propsOmit(http.Link.Link, [
  "id",
  "url",
  "image",
  "publishDate",
  "creator",
  "provider",
  "keywords",
  "events",
  "socialPosts",
  "createdAt",
  "updatedAt",
  "deletedAt",
]);

export const LinkArb: fc.Arbitrary<http.Link.Link> = getArbitrary(
  t.strict(linksProps),
).map((a) => ({
  ...a,
  title: fc.sample(HumanReadableStringArb(), 3).join(" "),
  description: fc.sample(HumanReadableStringArb(), 5).join(" "),
  image: fc.sample(MediaArb, 1).map((m) => ({
    ...m,
    type: "image/jpg" as const,
  }))[0],
  id: fc.sample(UUIDArb, 1)[0],
  url: fc.sample(URLArb, 1)[0],
  publishDate: fc.sample(DateArb, 1)[0],
  events: [],
  keywords: [],
  provider: undefined,
  creator: undefined,
  socialPosts: [],
  createdAt: fc.sample(DateArb, 1)[0],
  updatedAt: fc.sample(DateArb, 1)[0],
  deletedAt: undefined,
}));
