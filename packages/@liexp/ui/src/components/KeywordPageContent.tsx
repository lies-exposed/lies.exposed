import { Keyword } from "@liexp/shared/io/http";
import * as React from "react";
import { Grid, Typography } from "./mui";

export interface KeywordPageContentProps extends Keyword.Keyword {}

export const KeywordPageContent: React.FC<KeywordPageContentProps> = ({
  tag,
  color
}) => {
  return (
    <Grid container>
      <Grid item md={1} sm={1} xs={false} />
      <Grid item md={10}>
        <Typography variant="h4" color={color as any} style={{
          color: `#${color}`
        }}>
          #{tag}
        </Typography>
      </Grid>
    </Grid>
  );
};
