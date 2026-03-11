import * as StoryIO from "@liexp/io/lib/http/Story.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { DateArb } from "./Date.arbitrary.js";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const storyProps = StoryIO.Story.omit(
  "id",
  "title",
  "path",
  "date",
  "creator",
  "featuredImage",
  "body",
  "keywords",
  "links",
  "media",
  "actors",
  "groups",
  "events",
  "createdAt",
  "updatedAt",
  "deletedAt",
);

export const StoryArb: fc.Arbitrary<StoryIO.Story> = Arbitrary.make(
  storyProps,
).map((a) => ({
  ...a,
  id: fc.sample(UUIDArb, 1)[0],
  title: fc.sample(HumanReadableStringArb(), 3).join(" "),
  path: fc
    .sample(HumanReadableStringArb(), 2)
    .join("-")
    .toLowerCase()
    .replace(/\s+/g, "-"),
  date: fc.sample(DateArb, 1)[0],
  creator: undefined,
  featuredImage: undefined,
  body: null,
  keywords: [],
  links: [],
  media: [],
  actors: [],
  groups: [],
  events: [],
  createdAt: fc.sample(DateArb, 1)[0],
  updatedAt: fc.sample(DateArb, 1)[0],
  deletedAt: undefined,
}));
