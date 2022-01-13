import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { URL } from "../Common/URL";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";

export const ScientificStudyType = t.literal("ScientificStudy");
export type ScientificStudyType = t.TypeOf<typeof ScientificStudyType>;

export const ScientificStudyPayload = t.strict(
  {
    title: t.string,
    url: URL,
    conclusion: t.string,
    authors: t.array(UUID),
    publisher: UUID,
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
