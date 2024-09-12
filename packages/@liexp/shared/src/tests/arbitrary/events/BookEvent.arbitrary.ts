import { propsOmit } from "@liexp/core/lib/io/utils.js";
import { fc, getArbitrary } from "@liexp/test";
import * as t from "io-ts";
import * as Events from "../../../io/http/Events/index.js";
import { DateArb } from "../Date.arbitrary.js";
import { UUIDArb } from "../common/UUID.arbitrary.js";

export const BookEventArb = getArbitrary(
  t.strict(
    propsOmit(Events.Book.Book, [
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
    title: fc.sample(fc.string(), 1)[0],
    authors: [],
    media: {
      pdf: fc.sample(UUIDArb, 1)[0],
      audio: undefined,
    },
    publisher: undefined,
  },
}));
