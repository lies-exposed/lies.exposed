import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { apiProvider } from "@liexp/ui/lib/client/api.js";

export const Queries = fromEndpoints(apiProvider)(Endpoints);
