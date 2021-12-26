import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { URL } from "../Common/URL";
import { EventCommon } from "./BaseEvent";

export const ScientificStudyType = t.literal("ScientificStudy");
export type ScientificStudyType = t.TypeOf<typeof ScientificStudyType>;

export const CreateScientificStudyBody = t.strict(
  {
    title: t.string,
    type: ScientificStudyType,
    url: URL,
    body: t.unknown,
    publishDate: DateFromISOString,
    authors: t.array(UUID),
    publisher: UUID,
    conclusion: t.string,
  },
  "CreateScientificStudy"
);
export type CreateScientificStudyBody = t.TypeOf<
  typeof CreateScientificStudyBody
>;

// export const ScientificStudy = t.strict(
//   {
//     ...BaseProps.type.props,
//     ...CreateScientificStudyBody.type.props,
//     type: ScientificStudyType,
//     abstract: t.union([t.string, t.undefined]),
//     results: t.union([t.string, t.undefined]),
//   },
//   "ScientificStudy"
// );

// export type ScientificStudy = t.TypeOf<typeof ScientificStudy>;

const { publishDate, conclusion, type, ...scientificStudyBaseProps } =
  CreateScientificStudyBody.type.props;

export const ScientificStudyPayload = t.strict(
  {
    ...scientificStudyBaseProps,
  },
  "ScientificStudy"
);

export type ScientificStudyPayload = t.TypeOf<typeof ScientificStudyPayload>;


export const ScientificStudy = t.strict(
  {
    ...EventCommon.type.props,
    type: ScientificStudyType,
    payload: ScientificStudyPayload,
  },
  "ScientificStudy"
);

export type ScientificStudy = t.TypeOf<typeof ScientificStudy>;

