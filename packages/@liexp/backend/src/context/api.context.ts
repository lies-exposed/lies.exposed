import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type EndpointsRESTClient } from "@liexp/shared/lib/providers/EndpointsRESTClient/types";

export interface APIContext {
  api: EndpointsRESTClient<Endpoints>;
}
