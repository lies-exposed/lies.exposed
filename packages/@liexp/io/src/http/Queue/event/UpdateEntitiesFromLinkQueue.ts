import { Schema } from "effect";
import { UUID } from "../../Common/UUID.js";

export const UpdateEntitiesFromLinkType = Schema.Literal(
  "update-entities-from-link",
);
export type UpdateEntitiesFromLinkType =
  typeof UpdateEntitiesFromLinkType.Type;

export const UpdateEntitiesFromLinkQueueData = Schema.Struct({
  linkId: UUID,
}).annotations({
  title: "UpdateEntitiesFromLinkQueueData",
});

export type UpdateEntitiesFromLinkQueueData =
  typeof UpdateEntitiesFromLinkQueueData.Type;
