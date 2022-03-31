import SEO from "@liexp/ui/components/SEO";
import * as React from "react";
import * as ReactDOM from "react-dom";
import AdminPage from "./AdminPage";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <SEO title="admin" urlPath="" />
    <AdminPage />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
