import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { MIN_DATE, MAX_DATE } from "./Date.arbitrary";
import { OptionArb } from "./Option.arbitrary";
import { URLArb } from "./URL.arbitrary";

const { publishDate, authors, publisher, ...createScientificStudyProps } =
  http.Events.ScientificStudy.CreateScientificStudyBody.type.props;

export const CreateScientificStudyArb: tests.fc.Arbitrary<http.Events.ScientificStudy.CreateScientificStudyBody> =
  tests
    .getArbitrary(
      t.strict({
        ...createScientificStudyProps,
        url: t.string,
        abstract: t.union([t.string, t.undefined]),
        results: t.union([t.string, t.undefined]),
      })
    )
    .map((body) => ({
      ...body,
      abstract: tests.fc.sample(OptionArb(tests.fc.string()), 1)[0] as any,
      results: tests.fc.sample(OptionArb(tests.fc.string()), 1)[0] as any,
      publishDate: tests.fc.sample(
        tests.fc.date({ min: MIN_DATE, max: MAX_DATE })
      )[0],
      authors: tests.fc.sample(tests.fc.uuidV(4), 2) as any,
      publisher: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      url: tests.fc.sample(URLArb, 1)[0] ,
    }));

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  publishDate: _startDate,
  authors: _publishedBy,
  publisher: _publisher,
  id,
  ...scientificStudyProps
} = http.Events.ScientificStudy.ScientificStudy.type.props;

export const ScientificStudyArb: tests.fc.Arbitrary<http.Events.ScientificStudy.ScientificStudy> =
  tests
    .getArbitrary(
      t.strict({
        ...scientificStudyProps,
        abstract: t.union([t.string, t.undefined]),
        results: t.union([t.string, t.undefined]),
      })
    )
    .map((body) => ({
      ...body,
      id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
      publishDate: tests.fc.sample(
        tests.fc.date({ min: MIN_DATE, max: MAX_DATE })
      )[0],
      authors: tests.fc.sample(tests.fc.uuidV(4), 2) as any,
      publisher: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      url: tests.fc.sample(URLArb, 1)[0] ,
      createdAt: tests.fc.sample(
        tests.fc.date({ min: MIN_DATE, max: MAX_DATE }),
        1
      )[0],
      updatedAt: tests.fc.sample(
        tests.fc.date({ min: MIN_DATE, max: MAX_DATE }),
        1
      )[0],
    }));
