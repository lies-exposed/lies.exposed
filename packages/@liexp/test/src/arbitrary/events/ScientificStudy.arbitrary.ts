import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { DateArb, MAX_DATE, MIN_DATE } from "../Date.arbitrary.js";
import { URLArb } from "../URL.arbitrary.js";
import { BlockNoteDocumentArb } from "../common/BlockNoteDocument.arbitrary.js";
import { UUIDArb } from "../common/UUID.arbitrary.js";

const createScientificStudyProps =
  http.Events.ScientificStudy.CreateScientificStudyBody.omit(
    "excerpt",
    "body",
    "date",
    "draft",
    "payload",
    "media",
    "links",
    "keywords",
  );

export const CreateScientificStudyArb: fc.Arbitrary<http.Events.ScientificStudy.CreateScientificStudyBody> =
  Arbitrary.make(createScientificStudyProps).map((body) => ({
    ...body,
    draft: false,
    date: fc.sample(DateArb, 1)[0],
    excerpt: fc.sample(BlockNoteDocumentArb, 1)[0],
    body: fc.sample(BlockNoteDocumentArb, 1)[0],
    payload: {
      title: fc.sample(fc.string(), 1)[0],
      authors: fc.sample(UUIDArb, 2),
      image: fc.sample(URLArb, 1)[0],
      publisher: fc.sample(UUIDArb, 1)[0],
      url: fc.sample(UUIDArb, 1)[0],
    },
    media: [],
    links: [],
    keywords: [],
  }));

const scientificStudyProps = http.Events.ScientificStudy.ScientificStudy.omit(
  "id",
  "excerpt",
  "body",
  "payload",
  "date",
  "media",
  "keywords",
  "links",
  "socialPosts",
  "createdAt",
  "updatedAt",
  "deletedAt",
);

export const ScientificStudyArb: fc.Arbitrary<http.Events.ScientificStudy.ScientificStudy> =
  Arbitrary.make(scientificStudyProps).map((body) => ({
    ...body,
    id: fc.sample(UUIDArb, 1)[0],
    date: fc.sample(fc.date({ min: MIN_DATE, max: MAX_DATE }))[0],
    excerpt: fc.sample(BlockNoteDocumentArb, 1)[0],
    body: fc.sample(BlockNoteDocumentArb, 1)[0],
    payload: {
      title: fc.sample(fc.string(), 1)[0],
      authors: fc.sample(UUIDArb, 2),
      publisher: fc.sample(UUIDArb, 1)[0],
      image: fc.sample(URLArb, 1)[0],
      url: fc.sample(UUIDArb, 1)[0],
    },
    media: [],
    links: [],
    keywords: [],
    socialPosts: [],
    createdAt: fc.sample(fc.date({ min: MIN_DATE, max: MAX_DATE }), 1)[0],
    updatedAt: fc.sample(fc.date({ min: MIN_DATE, max: MAX_DATE }), 1)[0],
    deletedAt: undefined,
  }));
