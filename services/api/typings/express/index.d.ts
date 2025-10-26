import { type IncomingHttpHeaders } from "http";
import { type UUID } from '@liexp/shared/lib/io/http/Common/UUID.js';
import { AuthPermission } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { ServiceClient } from "@liexp/shared/lib/io/http/auth/index.js";
import { AuthUser } from "@liexp/shared/lib/io/http/auth/AuthUser.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      headers: IncomingHttpHeaders;
    }

    interface AuthRequest {
      user: AuthUser;
    }
  }
}
export {};
