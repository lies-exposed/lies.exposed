import { Container, Grid } from "@mui/material";
import * as React from "react";

interface MainContentProps {
  style?: React.CSSProperties;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  style = {},
}) => {
  return (
    <Container
      maxWidth="md"
      // style={{ flexDirection: "column" }}
      style={style}
    >
      <Grid>
        <Grid item>{children}</Grid>
      </Grid>
    </Container>
  );
};
