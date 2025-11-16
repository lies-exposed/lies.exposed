import type * as logger from "@liexp/core/lib/logger/index.js";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { type JWTProvider } from "../providers/jwt/jwt.provider.js";

export interface AuthAxiosClientConfig {
  baseURL: string;
  jwt: JWTProvider;
  logger: logger.Logger;
  signAs: "user" | "client";
  /**
   * Optional function to build the token payload
   * For 'user' mode, defaults to empty object
   * For 'client' mode, must provide ServiceClient payload
   */
  getPayload?: () => any;
}

/**
 * Create an Axios client with automatic JWT authentication
 * Adds an interceptor that sets the Authorization header with a Bearer token
 * The token is signed using the provided JWT provider
 */
export const makeAuthAxiosClient = (
  config: AuthAxiosClientConfig,
): AxiosInstance => {
  const client = axios.create({
    baseURL: config.baseURL,
  });

  client.interceptors.request.use(
    (req: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const payload = config.getPayload ? config.getPayload() : {};

      let token: string;
      if (config.signAs === "user") {
        token = config.jwt.signUser(payload as any)();
      } else {
        token = config.jwt.signClient(payload as any)();
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
