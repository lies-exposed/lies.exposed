import { Schema } from "effect/index";
import { UUID } from "../../Common/UUID.js";
import { AuthPermission } from "../permissions/index.js";

export const ServiceClient = Schema.Struct({
  id: UUID,
  userId: UUID,
  permissions: Schema.Array(AuthPermission),
});
export type ServiceClient = typeof ServiceClient.Type;
