import { clsx } from "clsx";
import * as React from "react";
import { Container, Grid } from "./mui";

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
      <Grid>
        <Grid item>{children}</Grid>
      </Grid>
    </Container>
  );
};
