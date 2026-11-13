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
  image: Schema.UndefinedOr(UUID),
  authors: Schema.Array(UUID),
  publisher: Schema.UndefinedOr(UUID),
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
  payload: Schema.Struct({
    // keys are optional: the admin sends the stored payload, which omits
    // `publisher` (and `image`) when unset
    title: Schema.optionalWith(Schema.String, { as: "Option" }),
    url: Schema.optionalWith(UUID, { as: "Option" }),
    image: Schema.optionalWith(Schema.NullOr(UUID), { as: "Option" }),
    authors: Schema.optionalWith(Schema.Array(UUID), { as: "Option" }),
    publisher: Schema.optionalWith(Schema.NullOr(UUID), { as: "Option" }),
  }),
}).annotations({
  title: "EditScientificStudyBody",
});

export type EditScientificStudyBody = typeof EditScientificStudyBody.Type;
export type EditScientificStudyBodyPayload =
  (typeof EditScientificStudyBody.Encoded)["payload"];

export const ScientificStudy = Schema.Struct({
  ...EventCommon.fields,
  type: SCIENTIFIC_STUDY,
  payload: ScientificStudyPayload,
}).annotations({
  title: "ScientificStudy",
});

export type ScientificStudy = typeof ScientificStudy.Type;
