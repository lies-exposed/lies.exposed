import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import {
  ConfigurationContext,
  defaultConfiguration,
} from "@liexp/ui/lib/context/ConfigurationContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataProviderContext } from "ra-core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import AdminPage from "./AdminPage";
import reportWebVitals from "./reportWebVitals";
// import main css
import "./index.css";

const container: any = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <ConfigurationContext.Provider value={defaultConfiguration}>
      <DataProviderContext.Provider
        value={APIRESTClient({ url: process.env.API_URL })}
      >
        <QueryClientProvider client={new QueryClient()}>
          <AdminPage />
        </QueryClientProvider>
      </DataProviderContext.Provider>
    </ConfigurationContext.Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
