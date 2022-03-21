import { dom } from "@fortawesome/fontawesome-svg-core";
import { ECOTheme } from "@liexp/ui/theme";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

// all css
import "./scss/main.css";


debug.enable("*");

// watch for font awesome icons
dom.watch();

function Main(): JSX.Element {
  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <ThemeProvider theme={ECOTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.hydrate(
  <React.StrictMode>
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
