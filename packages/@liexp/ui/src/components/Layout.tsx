import * as React from "react";
import { Footer } from "./Footer";
import Header, { HeaderProps } from "./Header";
import { Grid } from "./mui";

interface LayoutProps {
  style?: React.CSSProperties;
  header: HeaderProps;
}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({ style, header, children }) => {
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
