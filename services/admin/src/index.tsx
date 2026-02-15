import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { AgentAPIContext } from "@liexp/ui/lib/context/AgentAPIContext.js";
import { ConfigurationContext } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { DataProviderContext } from "@liexp/ui/lib/context/DataProviderContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIRESTClient } from "@ts-endpoint/react-admin";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { setupAxiosInterceptors } from "./setupAxiosInterceptors.js";
import { configuration } from "./configuration/index.js";
import reportWebVitals from "./reportWebVitals.js";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

config.autoAddCss = false;

debug.enable(import.meta.env.VITE_DEBUG ?? "@liexp:*:error");

// watch for font awesome icons
dom.watch();

import "@liexp/ui/lib/components/Common/Icons/library.js";

// import main css
import "./index.css";

// Setup global axios interceptors for 401 error handling
setupAxiosInterceptors();

/**
 * Set up global 401 error handler for API responses
 * This ensures that when a 401 is returned, the user is logged out
 */
const setupGlobal401Handler = () => {
  if (typeof window !== "undefined") {
    // Listen for storage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "auth" && e.newValue === null) {
        // Auth was cleared in another tab, redirect to login
        window.location.href = "/login";
      }
    });
  }
};

setupGlobal401Handler();

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
        <AgentAPIContext.Provider
          value={APIRESTClient({
            url: "/api/proxy/agent",
            getAuth: getAuthFromLocalStorage,
          })}
        >
          <QueryClientProvider client={new QueryClient()}>
            <AdminPage />
            {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={true} />} */}
          </QueryClientProvider>
        </AgentAPIContext.Provider>
      </DataProviderContext.Provider>
    </ConfigurationContext.Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example, reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
