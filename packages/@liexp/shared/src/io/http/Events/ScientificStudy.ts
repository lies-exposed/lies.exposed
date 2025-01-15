import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { SCIENTIFIC_STUDY } from "./EventType.js";

export const ScientificStudyPayload = t.strict(
  {
    title: t.string,
    url: UUID,
    image: t.union([UUID, t.string, t.undefined]),
    authors: t.array(UUID),
    publisher: t.union([UUID, t.undefined]),
  },
  "ScientificStudyPayload",
);

export type ScientificStudyPayload = t.TypeOf<typeof ScientificStudyPayload>;

export const CreateScientificStudyBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: SCIENTIFIC_STUDY,
    payload: ScientificStudyPayload,
  },
  "CreateScientificStudyBody",
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
  "EditScientificStudyBody",
);

export type EditScientificStudyBody = t.TypeOf<typeof EditScientificStudyBody>;

export const ScientificStudy = t.strict(
  {
    ...EventCommon.type.props,
    type: SCIENTIFIC_STUDY,
    payload: ScientificStudyPayload,
  },
  "ScientificStudy",
);

export type ScientificStudy = t.TypeOf<typeof ScientificStudy>;
