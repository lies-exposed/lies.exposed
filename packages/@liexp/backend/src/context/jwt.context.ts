import { type JWTProvider } from "../providers/jwt/jwt.provider.js";

export interface JWTProviderContext {
  jwt: JWTProvider;
}
