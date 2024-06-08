import { IncomingHttpHeaders } from "http";
import { UUID } from 'io-ts-types/lib/UUID';

declare global {
  namespace Express {
    interface User {
      id: UUID;
      firstName: string;
      lastName: string;
      username: string;
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
