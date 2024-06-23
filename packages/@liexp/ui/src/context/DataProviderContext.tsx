import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import * as React from "react";

export const DataProviderContext = React.createContext<APIRESTClient>(
  APIRESTClient({
    url: "https://alpha.api.lies.exposed/v1",
  }),
);
