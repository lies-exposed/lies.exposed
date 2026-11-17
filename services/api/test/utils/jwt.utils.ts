import { type JWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { type UserEncoded } from "@liexp/io/lib/http/User.js";

/**
 * Builds a full `UserEncoded` payload for `jwt.signUser`.
 *
 * The JWT provider signs a `UserEncoded` and verifies it against the
 * `AuthUser` schema, so the payload must satisfy the user schema instead of
 * being cast with `as any`.
 */
export const getUserTokenPayload = (
  overrides?: Partial<UserEncoded>,
): UserEncoded => ({
  id: uuid(),
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  email: "test@example.com",
  status: "Approved",
  permissions: ["admin:create"],
  telegramId: null,
  telegramToken: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  ...overrides,
});

export const getUserAuthorization = (
  ctx: { jwt: JWTProvider },
  overrides?: Partial<UserEncoded>,
): string => `Bearer ${ctx.jwt.signUser(getUserTokenPayload(overrides))()}`;
