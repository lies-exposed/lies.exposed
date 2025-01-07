import { type BACKEND_ENV } from "../io/ENV.js";

export interface ENVContext<E = BACKEND_ENV> {
  env: E;
}
