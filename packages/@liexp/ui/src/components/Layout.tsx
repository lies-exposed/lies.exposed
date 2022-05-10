import { Grid } from "@mui/material";
import * as React from "react";
import { Footer } from "./Footer";
import Header, { HeaderProps } from "./Header";

interface LayoutProps {
  style?: React.CSSProperties;
  header: HeaderProps;
}

export const Layout: React.FC<LayoutProps> = ({ style, header, children }) => {
  return (
    <Grid
      container
      alignItems="center"
      alignContent="center"
      style={{
        display: "flex",
      }}
    >
      <Grid item direction="column">
        <Header {...header} />
        {children}
      </Grid>
      <Footer />
    </Grid>
  );
};
