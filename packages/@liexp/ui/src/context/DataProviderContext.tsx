import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import * as React from "react";
import { getAuthFromLocalStorage } from "../client/api.js";

export const DataProviderContext = React.createContext<APIRESTClient>(
  APIRESTClient({
    url: "https://alpha.api.lies.exposed/v1",
    getAuth: getAuthFromLocalStorage,
  }),
);
