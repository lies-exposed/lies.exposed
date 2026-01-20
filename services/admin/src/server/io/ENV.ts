import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { AuthPermission } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Schema } from "effect";

/**
 * Admin Proxy Server Environment Schema
 *
 * Defines required environment variables for the admin proxy server:
 * - Server configuration (port, host)
 * - JWT secret for M2M auth
 * - Agent service URL
 * - ServiceClient identity (id, userId, permissions)
 * - Rate limiting config
 */

/**
 * Parse comma-separated permissions string into array of AuthPermission
 * Example: "admin:read,admin:create" -> ["admin:read", "admin:create"]
 */
const PermissionsFromString = Schema.transform(
  Schema.String,
  Schema.Array(AuthPermission),
  {
    strict: true,
    decode: (str) =>
      str
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean) as AuthPermission[],
    encode: (arr) => arr.join(","),
  },
).annotations({
  title: "PermissionsFromString",
  description: "Parse comma-separated permissions string into array",
});

export const AdminProxyENV = Schema.Struct({
  NODE_ENV: Schema.String,
  DEBUG: Schema.String,
  VIRTUAL_HOST: Schema.String,
  // vite public (client)
  VITE_PUBLIC_URL: Schema.String,
  // Server configuration
  SERVER_PORT: Schema.NumberFromString,
  SERVER_HOST: Schema.String,

  // JWT secret (must match agent/api services)
  JWT_SECRET: Schema.String,

  // Agent service configuration
  AGENT_API_URL: URL,

  // ServiceClient identity
  SERVICE_CLIENT_ID: UUID,
  SERVICE_CLIENT_USER_ID: UUID,
  SERVICE_CLIENT_PERMISSIONS: PermissionsFromString,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Schema.NumberFromString,
  RATE_LIMIT_MAX_REQUESTS: Schema.NumberFromString,
}).annotations({
  title: "AdminProxyENV",
  description: "Environment variables for admin proxy server",
});

export type AdminProxyENV = typeof AdminProxyENV.Type;
