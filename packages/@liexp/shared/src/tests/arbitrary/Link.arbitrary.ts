import { propsOmit } from "@liexp/core/lib/io/utils";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http";
import { DateArb } from "./Date.arbitrary";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { MediaArb } from "./Media.arbitrary";
import { URLArb } from "./URL.arbitrary";

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

export const LinkArb: tests.fc.Arbitrary<http.Link.Link> = tests
  .getArbitrary(t.strict(linksProps))
  .map((a) => ({
    ...a,
    title: tests.fc.sample(HumanReadableStringArb(), 3).join(" "),
    description: tests.fc.sample(HumanReadableStringArb(), 5).join(" "),
    image: tests.fc.sample(MediaArb, 1).map((m) => ({
      ...m,
      type: "image/jpg" as const,
    }))[0],
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    url: tests.fc.sample(URLArb, 1)[0],
    publishDate: tests.fc.sample(DateArb, 1)[0],
    events: [],
    keywords: [],
    provider: undefined,
    creator: undefined,
    socialPosts: [],
    createdAt: tests.fc.sample(DateArb, 1)[0],
    updatedAt: tests.fc.sample(DateArb, 1)[0],
    deletedAt: undefined,
  }));
