import { ECOTheme } from "@econnessione/ui/theme";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";

// all css
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "@econnessione/ui/theme/font.css";
import "ol/ol.css";
import "react-virtualized/styles.css";
import "./scss/main.css";
import { BrowserRouter } from "react-router-dom";

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
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
