import "@econnessione/ui/theme/font.css";
import { ECOTheme } from "@econnessione/ui/theme";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import debug from "debug";
import "ol/ol.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";
import "./scss/main.css";

debug.enable("*");

function Main(): JSX.Element {
  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <ThemeProvider theme={ECOTheme}>
      <App />
    </ThemeProvider>
  );
}

ReactDOM.hydrate(
  <React.StrictMode>
    <CssBaseline />
    <Main />
  </React.StrictMode>,
  document.getElementById("root")
);
