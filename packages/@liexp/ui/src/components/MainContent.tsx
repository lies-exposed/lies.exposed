import { clsx } from "clsx";
import * as React from "react";
import { Container, Grid } from "./mui/index.js";

interface MainContentProps {
  className?: string;
  style?: React.CSSProperties;
}

export const MainContent: React.FC<
  React.PropsWithChildren<MainContentProps>
> = ({ children, className, style = {} }) => {
  return (
    <Container
      className={clsx("main-content", className)}
      maxWidth="md"
      style={style}
    >
      <Grid container>
        <Grid size={12}>{children}</Grid>
      </Grid>
    </Container>
  );
};
