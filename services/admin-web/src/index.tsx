import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { ConfigurationContext } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { DataProviderContext } from "@liexp/ui/lib/context/DataProviderContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIRESTClient } from "@ts-endpoint/react-admin";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { configuration } from "./configuration/index.js";
import reportWebVitals from "./reportWebVitals.js";

config.autoAddCss = false;

debug.enable(import.meta.env.VITE_DEBUG ?? "@liexp:*:error");

// watch for font awesome icons
dom.watch();

import "@liexp/ui/lib/components/Common/Icons/library.js";

// import main css
import "./index.css";

const AdminPage = React.lazy(() => import("./AdminPage.js"));

const container =
  document.getElementById("root") ?? document.createElement("div");

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <ConfigurationContext.Provider value={configuration}>
      <DataProviderContext.Provider
        value={APIRESTClient({
          url: import.meta.env.VITE_API_URL,
          getAuth: getAuthFromLocalStorage,
        })}
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
