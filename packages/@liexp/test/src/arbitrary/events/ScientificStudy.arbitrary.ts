import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import fc from "fast-check";
import { getArbitrary } from "fast-check-io-ts";
import * as t from "io-ts";
import { MIN_DATE, MAX_DATE, DateArb } from "../Date.arbitrary.js";
import { URLArb } from "../URL.arbitrary.js";
import { UUIDArb } from "../common/UUID.arbitrary.js";

const createScientificStudyProps = propsOmit(
  http.Events.ScientificStudy.CreateScientificStudyBody,
  ["excerpt", "body", "date", "draft", "payload", "media", "links", "keywords"],
);

export const CreateScientificStudyArb: fc.Arbitrary<http.Events.ScientificStudy.CreateScientificStudyBody> =
  getArbitrary(t.strict(createScientificStudyProps)).map((body) => ({
    ...body,
    draft: false,
    date: fc.sample(DateArb, 1)[0],
    excerpt: {} as any,
    body: {} as any,
    payload: {
      title: fc.sample(fc.string(), 1)[0] as any,
      authors: fc.sample(UUIDArb, 2),
      image: fc.sample(URLArb, 1)[0],
      publisher: fc.sample(UUIDArb, 1)[0],
      url: fc.sample(URLArb, 1)[0],
    },
    media: [] as any,
    links: [] as any,
    keywords: [],
  }));

const scientificStudyProps = propsOmit(
  http.Events.ScientificStudy.ScientificStudy,
  [
    "id",
    "excerpt",
    "body",
    "payload",
    "date",
    "media",
    "keywords",
    "links",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ],
);

export const ScientificStudyArb: fc.Arbitrary<http.Events.ScientificStudy.ScientificStudy> =
  getArbitrary(t.strict(scientificStudyProps)).map((body) => ({
    ...body,
    id: fc.sample(UUIDArb, 1)[0] as any,
    date: fc.sample(fc.date({ min: MIN_DATE, max: MAX_DATE }))[0],
    excerpt: {},
    body: {},
    payload: {
      title: fc.sample(fc.string(), 1)[0],
      authors: fc.sample(UUIDArb, 2),
      publisher: fc.sample(UUIDArb, 1)[0],
      image: fc.sample(URLArb, 1)[0],
      url: fc.sample(URLArb, 1)[0],
    },
    media: [],
    links: [],
    keywords: [],
    createdAt: fc.sample(fc.date({ min: MIN_DATE, max: MAX_DATE }), 1)[0],
    updatedAt: fc.sample(fc.date({ min: MIN_DATE, max: MAX_DATE }), 1)[0],
    deletedAt: undefined,
  }));
