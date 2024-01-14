import * as React from "react";
import { Footer } from "./Footer.js";
import Header, { type HeaderProps } from "./Header/Header.js";
import { Grid } from "./mui/index.js";

interface LayoutProps {
  style?: React.CSSProperties;
  header: HeaderProps;
}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  style,
  header,
  children,
}) => {
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
