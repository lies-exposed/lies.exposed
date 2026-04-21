import { type AuthUser } from "@liexp/io/lib/http/auth/AuthUser.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    headers: IncomingHttpHeaders;
  }

  interface AuthRequest {
    user: AuthUser;
  }
}
