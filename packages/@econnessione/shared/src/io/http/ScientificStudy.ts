import * as t from "io-ts";
import { optionFromNullable, UUID } from "io-ts-types";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { URL } from "./Common/URL";

export const CreateScientificStudyBody = t.strict(
  {
    title: t.string,
    url: URL,
    abstract: optionFromNullable(t.string),
    results: optionFromNullable(t.string),
    conclusion: t.string,
    publishDate: DateFromISOString,
    authors: t.array(UUID),
    publisher: UUID,
  },
  "CreateScientificStudy"
);
export type CreateScientificStudyBody = t.TypeOf<
  typeof CreateScientificStudyBody
>;

export const ScientificStudy = t.strict(
  {
    ...BaseFrontmatter.type.props,
    ...CreateScientificStudyBody.type.props,
    abstract: t.union([t.string, t.undefined]),
    results: t.union([t.string, t.undefined]),
  },
  "ScientificStudy"
);

export type ScientificStudy = t.TypeOf<typeof ScientificStudy>;
