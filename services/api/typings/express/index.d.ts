import { type IncomingHttpHeaders } from "http";
import { type UUID } from '@liexp/shared/lib/io/http/Common/UUID.js';

declare global {
  namespace Express {
    interface User {
      id: UUID;
      firstName: string;
      lastName: string;
      username: string;
      createdAt: Date;
      updatedAt: Date;
    }

    interface Request {
      user?: User;
      headers: IncomingHttpHeaders;
    }

    interface AuthRequest {
      user: User;
    }
  }
}
export {};
