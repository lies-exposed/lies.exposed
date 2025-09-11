import { APIRESTClient } from "@ts-endpoint/react-admin";
import * as React from "react";
import { getAuthFromLocalStorage } from "../client/api.js";

export const DataProviderContext = React.createContext<APIRESTClient>(
  APIRESTClient({
    url: "https://api.lies.exposed/v1",
    getAuth: getAuthFromLocalStorage,
  }),
);
