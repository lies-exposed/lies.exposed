import type * as logger from "@liexp/core/lib/logger/index.js";
import { type UserEncoded } from "@liexp/shared/lib/io/http/User.js";
import { type ServiceClient } from "@liexp/shared/lib/io/http/auth/index.js";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { type JWTProvider } from "../providers/jwt/jwt.provider.js";

export type AuthAxiosClientConfig<S extends "user" | "client"> = {
  baseURL: string;
  jwt: JWTProvider;
  logger: logger.Logger;
} & (S extends "user"
  ? {
      signAs: "user";
      /**
       * Optional function to build the token payload
       * For 'user' mode, defaults to empty object
       * For 'client' mode, must provide ServiceClient payload
       */
      getPayload: () => UserEncoded;
    }
  : { signAs: "client"; getPayload: () => ServiceClient });

/**
 * Create an Axios client with automatic JWT authentication
 * Adds an interceptor that sets the Authorization header with a Bearer token
 * The token is signed using the provided JWT provider
 */
export const makeAuthAxiosClient = <S extends "user" | "client">(
  config: AuthAxiosClientConfig<S>,
): AxiosInstance => {
  const client = axios.create({
    baseURL: config.baseURL,
  });

  client.interceptors.request.use(
    (req: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      let token: string;
      if (config.signAs === "user") {
        const payload = config.getPayload();
        token = config.jwt.signUser(payload)();
      } else {
        const payload = config.getPayload();
        token = config.jwt.signClient(payload)();
      }

      req.headers.set("Authorization", `Bearer ${token}`);

      config.logger.debug.log(
        "Added auth header to request: %s %s",
        req.method?.toUpperCase(),
        req.url,
      );

      return req;
    },
  );

  return client;
};
