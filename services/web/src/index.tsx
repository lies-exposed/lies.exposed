import "ol/ol.css";
import "./scss/main.css";
import debug from "debug";
import * as React from "react";
import { render } from "react-dom";
import { App } from "./App";

debug.enable('*');

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
