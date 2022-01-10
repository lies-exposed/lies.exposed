import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { URL } from "../Common/URL";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";

export const ScientificStudyType = t.literal("ScientificStudy");
export type ScientificStudyType = t.TypeOf<typeof ScientificStudyType>;

export const ScientificStudyPayload = t.strict(
  {
    title: t.string,
    url: URL,
    publishDate: DateFromISOString,
    authors: t.array(UUID),
    publisher: UUID,
    conclusion: t.string,
  },
  "ScientificStudyPayload"
);

export type ScientificStudyPayload = t.TypeOf<typeof ScientificStudyPayload>;

export const CreateScientificStudyBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: ScientificStudyType,
    payload: ScientificStudyPayload,
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
    payload: ScientificStudyPayload,
    title: optionFromUndefined(t.string),
  },
  "EditScientificStudyBody"
);

export type EditScientificStudyBody = t.TypeOf<typeof EditScientificStudyBody>;



export const ScientificStudy = t.strict(
  {
    ...EventCommon.type.props,
    type: ScientificStudyType,
    payload: ScientificStudyPayload,
  },
  "ScientificStudy"
);

export type ScientificStudy = t.TypeOf<typeof ScientificStudy>;
