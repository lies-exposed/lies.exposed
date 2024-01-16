import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Grid, Typography } from "./mui/index.js";

export interface KeywordPageContentProps {
  keyword: Keyword.Keyword;
}

export const KeywordPageContent: React.FC<KeywordPageContentProps> = ({
  keyword: { id, tag, color },
}) => {
  return (
    <Grid container>
      <Grid item md={1} sm={1} xs={false} />
      <Grid item md={6}>
        <Typography
          variant="h4"
          color={color as any}
          style={{
            color: `#${color}`,
          }}
        >
          #{tag}
        </Typography>
      </Grid>
    </Grid>
  );
};
