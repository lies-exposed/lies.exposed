import * as tests from "@liexp/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { propsOmit } from "../../io/utils";
import { DateArb } from "./Date.arbitrary";
import { MediaArb } from "./Media.arbitrary";
import { URLArb } from "./URL.arbitrary";

const linksProps = propsOmit(http.Link.Link, [
  "id",
  "url",
  "image",
  "publishDate",
  "provider",
  "keywords",
  "events",
  "createdAt",
  "updatedAt",
]);

export const LinkArb: tests.fc.Arbitrary<http.Link.Link> = tests
  .getArbitrary(t.strict(linksProps))
  .map((a) => ({
    ...a,
    image: tests.fc.sample(MediaArb, 1)[0],
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    url: tests.fc.sample(URLArb, 1)[0],
    publishDate: tests.fc.sample(DateArb, 1)[0],
    events: [],
    keywords: [],
    provider: undefined,
    createdAt: tests.fc.sample(DateArb, 1)[0],
    updatedAt: tests.fc.sample(DateArb, 1)[0],
  }));
