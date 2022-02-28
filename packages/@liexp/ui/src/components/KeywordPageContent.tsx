import { Keyword } from "@liexp/shared/io/http";
import { Grid, Typography } from "@material-ui/core";
import * as React from "react";

export interface KeywordPageContentProps extends Keyword.Keyword {}

export const KeywordPageContent: React.FC<KeywordPageContentProps> = ({
  tag,
  color
}) => {
  return (
    <Grid container>
      <Grid item>
        <Typography variant="h3" color={color as any} style={{
          color: `#${color}`
        }}>
          #{tag}
        </Typography>
      </Grid>
    </Grid>
  );
};
