import { Schema } from "effect";
import { UUID } from "../Common/UUID.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { SCIENTIFIC_STUDY } from "./EventType.js";

export const ScientificStudyPayload = Schema.Struct({
  title: Schema.String,
  url: UUID,
  image: Schema.Union(UUID, Schema.String, Schema.Undefined),
  authors: Schema.Array(UUID),
  publisher: Schema.Union(UUID, Schema.Undefined),
}).annotations({
  title: "ScientificStudyPayload",
});

export type ScientificStudyPayload = typeof ScientificStudyPayload.Type;

export const CreateScientificStudyBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: SCIENTIFIC_STUDY,
  payload: ScientificStudyPayload,
}).annotations({
  title: "CreateScientificStudyBody",
});

export type CreateScientificStudyBody = typeof CreateScientificStudyBody.Type;

export const EditScientificStudyBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: SCIENTIFIC_STUDY,
  payload: ScientificStudyPayload,
}).annotations({
  title: "EditScientificStudyBody",
});

export type EditScientificStudyBody = typeof EditScientificStudyBody.Type;

export const ScientificStudy = Schema.Struct({
  ...EventCommon.fields,
  type: SCIENTIFIC_STUDY,
  payload: ScientificStudyPayload,
}).annotations({
  title: "ScientificStudy",
});

export type ScientificStudy = typeof ScientificStudy.Type;
