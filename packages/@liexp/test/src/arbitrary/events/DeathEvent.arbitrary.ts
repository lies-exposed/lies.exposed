import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as Events from "@liexp/shared/lib/io/http/Events/index.js";
import fc from "fast-check";
import { getArbitrary } from "fast-check-io-ts";
import * as t from "io-ts";
import { DateArb } from "../Date.arbitrary.js";
import { UUIDArb } from "../common/UUID.arbitrary.js";

export const DeathEventArb = getArbitrary(
  t.strict(
    propsOmit(Events.Death.Death, [
      "id",
      "excerpt",
      "body",
      "date",
      "media",
      "links",
      "keywords",
      "payload",
      "socialPosts",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ]),
  ),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  date: fc.sample(DateArb, 1)[0],
  createdAt: fc.sample(DateArb, 1)[0],
  updatedAt: fc.sample(DateArb, 1)[0],
  deletedAt: undefined,
  excerpt: undefined,
  body: undefined,
  media: fc.sample(UUIDArb, 5),
  keywords: fc.sample(UUIDArb, 5),
  links: fc.sample(UUIDArb, 5),
  socialPosts: [],
  payload: {
    victim: fc.sample(UUIDArb, 1)[0],
    location: undefined,
  },
}));
