import { Grid } from "@material-ui/core";
import * as React from "react";
import { Footer } from "./Footer";
import Header from "./Header";

interface LayoutProps {
  style?: React.CSSProperties;
}

export const Layout: React.FC<LayoutProps> = ({ children, style }) => {
  return (
    <Grid container alignItems="center" alignContent="center">
      <Grid item direction="column" alignItems="center">
        <Header />
        {children}
      </Grid>
      <Footer />
    </Grid>
  );
};
