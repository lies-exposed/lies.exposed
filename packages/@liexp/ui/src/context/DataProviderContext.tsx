import React from "react";
import { apiProvider } from "../client/api.js";

export const DataProviderContext = React.createContext(apiProvider);
