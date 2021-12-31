import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { URL } from "../Common/URL";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";

export const ScientificStudyType = t.literal("ScientificStudy");
export type ScientificStudyType = t.TypeOf<typeof ScientificStudyType>;

export const CreateScientificStudyBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    title: t.string,
    type: ScientificStudyType,
    url: URL,
    body: t.UnknownRecord,
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

export const EditScientificStudyBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: ScientificStudyType,
    title: optionFromUndefined(t.string),
  },
  "EditScientificStudyBody"
);

export type EditScientificStudyBody = t.TypeOf<typeof EditScientificStudyBody>;

const {
  publishDate,
  conclusion,
  type,
  excerpt,
  keywords,
  media,
  links,
  date,
  draft,
  ...scientificStudyBaseProps
} = CreateScientificStudyBody.type.props;

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
