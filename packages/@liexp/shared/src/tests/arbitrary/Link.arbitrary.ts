import * as tests from "@liexp/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { propsOmit } from "../../io/utils";
import { DateArb } from "./Date.arbitrary";
import { URLArb } from "./URL.arbitrary";

const linksProps = propsOmit(http.Link.Link, [
  "id",
  "url",
  "publishDate",
  "createdAt",
  "updatedAt",
]);

export const LinkArb: tests.fc.Arbitrary<http.Link.Link> = tests
  .getArbitrary(t.strict(linksProps))
  .map((a) => ({
    ...a,
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    url: tests.fc.sample(URLArb, 1)[0],
    publishDate: tests.fc.sample(DateArb, 1)[0],
    createdAt: tests.fc.sample(DateArb, 1)[0],
    updatedAt: tests.fc.sample(DateArb, 1)[0],
  }));
