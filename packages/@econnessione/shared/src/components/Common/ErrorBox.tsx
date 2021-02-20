import { Grid } from "@material-ui/core";
import * as React from "react";

export const ErrorBox: (e: any) => React.ReactElement = (e: any) => {
  return (
    <Grid item>
      <h4>An error occured</h4>
      <div>
        <code>{JSON.stringify(e, null, 2)}</code>
      </div>
    </Grid>
  );
};
