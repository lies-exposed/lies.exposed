import { APIRESTClient } from "@ts-endpoint/react-admin";
import * as React from "react";

export const JSONAPIProviderContext = React.createContext(
  APIRESTClient({
    // todo: should be the endpoint of space storage
    url: "https://api.lies.exposed/v1",
  }),
);
