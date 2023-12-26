import { Endpoints } from "@liexp/shared/lib/endpoints";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient";
import { apiProvider } from "@liexp/ui/lib/client/api";

export const Queries = fromEndpoints(apiProvider)(Endpoints);
