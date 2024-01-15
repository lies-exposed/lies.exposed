import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../../io/http/index.js";
import { MIN_DATE, MAX_DATE, DateArb } from "../Date.arbitrary.js";
import { URLArb } from "../URL.arbitrary.js";

const createScientificStudyProps = propsOmit(
  http.Events.ScientificStudy.CreateScientificStudyBody.types[0],
  ["excerpt", "body", "date", "draft", "payload", "media", "links", "keywords"],
);

export const CreateScientificStudyArb: tests.fc.Arbitrary<http.Events.ScientificStudy.CreateScientificStudyBody> =
  tests.getArbitrary(t.strict(createScientificStudyProps)).map((body) => ({
    type: http.Events.EventTypes.SCIENTIFIC_STUDY.value,
    draft: false,
    date: tests.fc.sample(DateArb, 1)[0],
    excerpt: {} as any,
    body: {} as any,
    payload: {
      title: tests.fc.sample(tests.fc.string(), 1)[0] as any,
      authors: tests.fc.sample(tests.fc.uuidV(4), 2) as any,
      image: tests.fc.sample(URLArb, 1)[0],
      publisher: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      url: tests.fc.sample(URLArb, 1)[0],
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

export const ScientificStudyArb: tests.fc.Arbitrary<http.Events.ScientificStudy.ScientificStudy> =
  tests.getArbitrary(t.strict(scientificStudyProps)).map((body) => ({
    ...body,
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    date: tests.fc.sample(tests.fc.date({ min: MIN_DATE, max: MAX_DATE }))[0],
    excerpt: {},
    body: {},
    payload: {
      title: tests.fc.sample(tests.fc.string(), 1)[0],
      body: tests.fc.sample(tests.fc.object(), 1)[0],
      authors: tests.fc.sample(tests.fc.uuidV(4), 2) as any,
      publisher: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      image: tests.fc.sample(URLArb, 1)[0],
      url: tests.fc.sample(URLArb, 1)[0],
    },
    media: [],
    links: [],
    keywords: [],
    createdAt: tests.fc.sample(
      tests.fc.date({ min: MIN_DATE, max: MAX_DATE }),
      1,
    )[0],
    updatedAt: tests.fc.sample(
      tests.fc.date({ min: MIN_DATE, max: MAX_DATE }),
      1,
    )[0],
    deletedAt: undefined,
  }));
