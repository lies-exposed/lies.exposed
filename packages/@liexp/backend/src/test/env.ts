import { type BACKEND_ENV } from "../io/ENV.js";

/**
 * Fully typed {@link BACKEND_ENV} fixture for flow specs so test contexts no
 * longer need `as unknown as ENVContext["env"]` casts on partial env objects.
 */
export const TEST_BACKEND_ENV: BACKEND_ENV = {
  DB_USERNAME: "test",
  DB_PASSWORD: "test",
  DB_HOST: "localhost",
  DB_PORT: 5432,
  DB_DATABASE: "test",
  DB_SSL_MODE: "off",
  SPACE_BUCKET: "test-bucket",
  SPACE_ENDPOINT: "http://localhost:9000",
  SPACE_REGION: "us-east-1",
  SPACE_ACCESS_KEY_ID: "test",
  SPACE_ACCESS_KEY_SECRET: "test",
  SPACE_USE_TLS: false,
  NODE_ENV: "test",
  DEBUG: "false",
  DEFAULT_PAGE_SIZE: 20,
};
