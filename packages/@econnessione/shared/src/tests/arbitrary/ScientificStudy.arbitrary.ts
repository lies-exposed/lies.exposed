import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { MIN_DATE, MAX_DATE, DateArb } from "./Date.arbitrary";
import { URLArb } from "./URL.arbitrary";
import { propsOmit } from "./utils.arbitrary";

const createScientificStudyProps = propsOmit(
  http.Events.ScientificStudy.CreateScientificStudyBody,
  [
    "excerpt",
    "date",
    "draft",
    "payload",
    "media",
    "links",
    "keywords",
  ]
);

export const CreateScientificStudyArb: tests.fc.Arbitrary<http.Events.ScientificStudy.CreateScientificStudyBody> =
  tests.getArbitrary(t.strict(createScientificStudyProps)).map((body) => ({
    type: 'ScientificStudy',
    draft: false,
    date: tests.fc.sample(DateArb, 1)[0],
    excerpt: {},
    payload: {
      title: tests.fc.sample(tests.fc.string(), 1)[0] as any,
      publishDate: tests.fc.sample(
        tests.fc.date({ min: MIN_DATE, max: MAX_DATE })
      )[0],
      authors: tests.fc.sample(tests.fc.uuidV(4), 2) as any,
      publisher: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      url: tests.fc.sample(URLArb, 1)[0],
      conclusion: tests.fc.sample(tests.fc.string(), 1)[0],
      body: {},
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
    "payload",
    "date",
    "media",
    "keywords",
    "links",
    "createdAt",
    "updatedAt",
  ]
);

export const ScientificStudyArb: tests.fc.Arbitrary<http.Events.ScientificStudy.ScientificStudy> =
  tests.getArbitrary(t.strict(scientificStudyProps)).map((body) => ({
    ...body,
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    date: tests.fc.sample(tests.fc.date({ min: MIN_DATE, max: MAX_DATE }))[0],
    excerpt: {},
    payload: {
      title: tests.fc.sample(tests.fc.string(), 1)[0],
      body: tests.fc.sample(tests.fc.object(), 1)[0],
      authors: tests.fc.sample(tests.fc.uuidV(4), 2) as any,
      publisher: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      publishDate: tests.fc.sample(DateArb, 1)[0],
      conclusion: tests.fc.sample(tests.fc.string(), 1)[0],
      url: tests.fc.sample(URLArb, 1)[0],
    },
    media: [],
    links: [],
    keywords: [],
    createdAt: tests.fc.sample(
      tests.fc.date({ min: MIN_DATE, max: MAX_DATE }),
      1
    )[0],
    updatedAt: tests.fc.sample(
      tests.fc.date({ min: MIN_DATE, max: MAX_DATE }),
      1
    )[0],
  }));
