import { Card, Grid, Typography } from "@material-ui/core";
import * as React from "react";

export const ErrorBox: (e: any) => React.ReactElement = (e: any) => {
  return (
    <Grid item>
      <Card>
        <Typography>An error occured</Typography>
        <div>
          <code>{JSON.stringify(e, null, 2)}</code>
        </div>
      </Card>
    </Grid>
  );
};
