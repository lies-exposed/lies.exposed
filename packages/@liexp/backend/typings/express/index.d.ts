import { type IncomingHttpHeaders } from "http";
import { type AuthUser } from "@liexp/shared/lib/io/http/auth/AuthUser.js";

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
