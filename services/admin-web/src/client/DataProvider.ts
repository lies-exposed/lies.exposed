import { Endpoints } from "@liexp/shared/lib/endpoints";
import { apiProvider } from "@liexp/ui/lib/client/api";
import { fromEndpoints } from "@liexp/ui/lib/providers/EndpointsRESTClient/EndpointsRESTClient";

export const Queries = fromEndpoints(apiProvider)(Endpoints);
