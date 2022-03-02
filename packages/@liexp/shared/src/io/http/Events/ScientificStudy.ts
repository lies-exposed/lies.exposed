import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { URL } from "../Common/URL";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";

export const SCIENTIFIC_STUDY = t.literal("ScientificStudy");
export type SCIENTIFIC_STUDY = t.TypeOf<typeof SCIENTIFIC_STUDY>;

export const ScientificStudyPayload = t.strict(
  {
    title: t.string,
    url: URL,
    image: t.union([t.string, t.undefined]),
    authors: t.array(UUID),
    publisher: t.union([UUID, t.undefined]),
  },
  "ScientificStudyPayload"
);

export type ScientificStudyPayload = t.TypeOf<typeof ScientificStudyPayload>;

export const CreateScientificStudyBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: SCIENTIFIC_STUDY,
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
    type: SCIENTIFIC_STUDY,
    payload: ScientificStudyPayload,
  },
  "EditScientificStudyBody"
);

export type EditScientificStudyBody = t.TypeOf<typeof EditScientificStudyBody>;

export const ScientificStudy = t.strict(
  {
    ...EventCommon.type.props,
    type: SCIENTIFIC_STUDY,
    payload: ScientificStudyPayload,
  },
  "ScientificStudy"
);

export type ScientificStudy = t.TypeOf<typeof ScientificStudy>;
