import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { DateArb } from "./Date.arbitrary.js";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { MediaArb } from "./Media.arbitrary.js";
import { URLArb } from "./URL.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const linksProps = http.Link.Link.omit(
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
);

export const LinkArb: fc.Arbitrary<http.Link.Link> = Arbitrary.make(
  linksProps,
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
