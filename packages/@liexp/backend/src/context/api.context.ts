import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type EndpointsRESTClient } from "@ts-endpoint/react-admin";

export interface APIContext {
  api: EndpointsRESTClient<Endpoints>;
}
