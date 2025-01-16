import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type EndpointsRESTClient } from "@liexp/shared/lib/providers/EndpointsRESTClient/types.js";

export interface APIContext {
  api: EndpointsRESTClient<Endpoints>;
}
