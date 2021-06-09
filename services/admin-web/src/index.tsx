import React from "react";
import ReactDOM from "react-dom";
import Helmet from "react-helmet";
import AdminPage from "./AdminPage";
import reportWebVitals from "./reportWebVitals";
import "ol/ol.css";

ReactDOM.render(
  <React.StrictMode>
    <Helmet
      link={[
        {
          rel: "stylesheet",
          type: "text/css",
          href: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css",
        },
        {
          rel: "stylesheet",
          type: "text/css",
          href: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css",
        },
      ]}
    />
    <AdminPage />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
