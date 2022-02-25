import { Keyword } from "@liexp/shared/io/http";
import { Grid, Typography } from "@material-ui/core";
import * as React from "react";

export interface KeywordPageContentProps extends Keyword.Keyword {}

export const KeywordPageContent: React.FC<KeywordPageContentProps> = ({
  tag,
}) => {
  return (
    <Grid container>
      <Grid item>
        <Typography variant="h3">{tag}</Typography>
        {/* <MarkdownRenderer>{body}</MarkdownRenderer> */}
      </Grid>
    </Grid>
  );
};
