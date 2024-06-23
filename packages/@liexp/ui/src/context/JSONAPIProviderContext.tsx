import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider";
import * as React from "react";

export const JSONAPIProviderContext = React.createContext(
  APIRESTClient({
    // todo: should be the endpoint of space storage
    url: "https://alpha.api.lies.exposed/v1",
  }),
);
