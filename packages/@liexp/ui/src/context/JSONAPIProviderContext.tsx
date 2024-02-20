import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider";
import React from "react";

export const JSONAPIProviderContext = React.createContext(
  APIRESTClient({
    // todo: should be the endpoint of space storage
    url: "https://api.alpha.lies.exposed",
  }),
);
