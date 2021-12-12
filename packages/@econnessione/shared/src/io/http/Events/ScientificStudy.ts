import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseProps } from "../Common/BaseProps";
import { URL } from "../Common/URL";

export const CreateScientificStudyBody = t.strict(
  {
    title: t.string,
    url: URL,
    body: t.unknown,
    publishDate: DateFromISOString,
    authors: t.array(UUID),
    publisher: UUID,
    keywords: t.array(UUID)
  },
  "CreateScientificStudy"
);
export type CreateScientificStudyBody = t.TypeOf<
  typeof CreateScientificStudyBody
>;

export const ScientificStudyType = t.literal("ScientificStudy");
export type ScientificStudyType = t.TypeOf<typeof ScientificStudyType>;

export const ScientificStudy = t.strict(
  {
    ...BaseProps.type.props,
    ...CreateScientificStudyBody.type.props,
    type: ScientificStudyType,
    abstract: t.union([t.string, t.undefined]),
    results: t.union([t.string, t.undefined]),
  },
  "ScientificStudy"
);

export type ScientificStudy = t.TypeOf<typeof ScientificStudy>;

const { publishDate,  ...scientificStudyBaseProps } =
  CreateScientificStudyBody.type.props;

export const ScientificStudyV2 = t.strict(
  {
    ...scientificStudyBaseProps,
  },
  "ScientificStudy"
);

export type ScientificStudyV2 = t.TypeOf<typeof ScientificStudy>;
