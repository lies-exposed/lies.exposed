import * as React from "react";
import * as ReactDOM from "react-dom/client";
import AdminPage from "./AdminPage";
import reportWebVitals from "./reportWebVitals";
import './index.css';

const container: any = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <AdminPage />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
