import { propsOmit } from "@liexp/core/lib/io/utils";
import { fc, getArbitrary } from "@liexp/test";
import * as t from "io-ts";
import * as Events from "../../../io/http/Events";
import { DateArb } from "../Date.arbitrary";

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
  id: fc.sample(fc.uuid(), 1)[0],
  date: fc.sample(DateArb, 1)[0],
  createdAt: fc.sample(DateArb, 1)[0],
  updatedAt: fc.sample(DateArb, 1)[0],
  deletedAt: undefined,
  excerpt: {},
  body: {},
  media: fc.sample(fc.uuid(), 5) as any[],
  keywords: fc.sample(fc.uuid(), 5) as any[],
  links: fc.sample(fc.uuid(), 5) as any[],
  socialPosts: [],
  payload: {
    title: fc.sample(fc.string(), 1)[0],
    authors: [],
    media: {
      pdf: fc.sample(fc.uuid(), 1)[0],
      audio: undefined,
    },
    publisher: undefined,
  },
}));
