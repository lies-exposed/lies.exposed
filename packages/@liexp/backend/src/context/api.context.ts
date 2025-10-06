import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type API } from "@ts-endpoint/resource-client";

export interface APIContext {
  api: API<Endpoints>;
}
