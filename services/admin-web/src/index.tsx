import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { GetOpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { ConfigurationContext } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { DataProviderContext } from "@liexp/ui/lib/context/DataProviderContext.js";
import { OpenAIContext } from "@liexp/ui/lib/context/OpenAIContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import AdminPage from "./AdminPage.js";
import { configuration } from "./configuration/index.js";
import reportWebVitals from "./reportWebVitals.js";

config.autoAddCss = false;

debug.enable(import.meta.env.VITE_DEBUG ?? "@liexp:*:error");

// watch for font awesome icons
dom.watch();

import "@liexp/ui/lib/components/Common/Icons/library.js";

// import main css
import "./index.css";

const container: any = document.getElementById("root");
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
          <OpenAIContext.Provider
            value={GetOpenAIProvider({
              baseURL: import.meta.env.VITE_OPENAI_URL,
              dangerouslyAllowBrowser: true,
              timeout: 120 * 1000,
            })}
          >
            <AdminPage />
          </OpenAIContext.Provider>
        </QueryClientProvider>
      </DataProviderContext.Provider>
    </ConfigurationContext.Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
