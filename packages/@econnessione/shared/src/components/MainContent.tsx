import { Container, Grid } from "@material-ui/core";
import * as React from "react";
import { StyleObject } from "styletron-react";

interface MainContentProps {
  style?: StyleObject;
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
