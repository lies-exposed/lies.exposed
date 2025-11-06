import * as Events from "@liexp/shared/lib/io/http/Events/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { DateArb } from "../Date.arbitrary.js";
import { BlockNoteDocumentArb } from "../common/BlockNoteDocument.arbitrary.js";
import { BySubjectIdArb } from "../common/BySubject.arbitrary.js";
import { UUIDArb } from "../common/UUID.arbitrary.js";

export const TransactionEventArb = Arbitrary.make<
  any,
  any,
  Events.Transaction.Transaction
>(
  Events.Transaction.Transaction.omit(
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
  ),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  date: fc.sample(DateArb, 1)[0],
  createdAt: fc.sample(DateArb, 1)[0],
  updatedAt: fc.sample(DateArb, 1)[0],
  deletedAt: undefined,
  excerpt: fc.sample(BlockNoteDocumentArb, 1)[0],
  body: fc.sample(BlockNoteDocumentArb, 1)[0],
  media: fc.sample(UUIDArb, 5),
  keywords: fc.sample(UUIDArb, 5),
  links: fc.sample(UUIDArb, 5),
  socialPosts: [],
  payload: {
    title: fc.sample(fc.string(), 1)[0],
    total: fc.sample(fc.integer(), 1)[0],
    currency: fc.sample(fc.string(), 1)[0],
    from: fc.sample(BySubjectIdArb, 1)[0],
    to: fc.sample(BySubjectIdArb, 1)[0],
  },
}));
