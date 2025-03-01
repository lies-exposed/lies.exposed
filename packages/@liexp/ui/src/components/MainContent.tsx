import { clsx } from "clsx";
import * as React from "react";
import { Container, Grid2 } from "./mui/index.js";

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
      <Grid2 container>
        <Grid2 size={12}>{children}</Grid2>
      </Grid2>
    </Container>
  );
};
