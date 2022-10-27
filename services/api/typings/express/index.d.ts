import { IncomingHttpHeaders } from 'http';

declare global {
  namespace Express {
    interface User {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
    }

    interface Request {
      user?: User;
      headers: IncomingHttpHeaders
    }

    interface AuthRequest {
      user: User;
    }
  }
}
export {};
