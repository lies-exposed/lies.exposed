import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { URL } from "../Common/URL";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";

export const SCIENTIFIC_STUDY = t.literal("ScientificStudy");
export type SCIENTIFIC_STUDY = t.TypeOf<typeof SCIENTIFIC_STUDY>;

export const ScientificStudyPayload = t.strict(
  {
    title: t.string,
    url: URL,
    image: t.union([UUID, t.string, t.undefined]),
    authors: t.array(UUID),
    publisher: t.union([UUID, t.undefined]),
  },
  "ScientificStudyPayload"
);

export type ScientificStudyPayload = t.TypeOf<typeof ScientificStudyPayload>;

export const CreateScientificStudyPlainBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: SCIENTIFIC_STUDY,
    payload: ScientificStudyPayload,
  },
  "CreateScientificStudyPlainBody"
);
export type CreateScientificStudyPlainBody = t.TypeOf<
  typeof CreateScientificStudyPlainBody
>;

export const CreateScientificStudyBody = t.union(
  [CreateScientificStudyPlainBody, t.strict({ url: URL })],
  "CreateScientificStudyBody"
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
