import "ol/ol.css";
import "./scss/main.css";
import * as React from "react";
import { render } from "react-dom";
import { App } from "./App";

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
