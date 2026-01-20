import { Schema } from "effect/index";
import { UUID } from "../Common/UUID.js";
import { AuthPermission } from "./permissions/index.js";

export const AuthUser = Schema.Struct({
  id: UUID,
  email: Schema.String,
  permissions: Schema.Array(AuthPermission),
  iat: Schema.Number,
  exp: Schema.Number,
});
export type AuthUser = typeof AuthUser.Type;
