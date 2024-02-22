import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import React from "react";

export const DataProviderContext = React.createContext<APIRESTClient>(
  APIRESTClient({
    url: "https://api.alpha.lies.exposed",
  }),
);
