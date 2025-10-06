import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Grid, Typography } from "./mui/index.js";

export interface KeywordPageContentProps {
  keyword: Keyword.Keyword;
}

export const KeywordPageContent: React.FC<KeywordPageContentProps> = ({
  keyword: { id: _id, tag, color },
}) => {
  return (
    <Grid container>
      <Grid size={{ md: 1, sm: 1, xs: null }} />
      <Grid size={{ md: 6 }}>
        <Typography
          variant="h4"
          color={color}
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
