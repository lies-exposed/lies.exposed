import * as React from "react";
import { Card, Grid, Typography } from "../mui";

export const ErrorBox: (e: any) => React.ReactElement = (e: any) => {
  return (
    <Grid item>
      <Card>
        <Typography>An error occurred</Typography>
        <div style={{ width: "100%" }}>{JSON.stringify(e, null, 4)}</div>
      </Card>
    </Grid>
  );
};
