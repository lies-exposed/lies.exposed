import { Keyword } from "@liexp/shared/io/http";
import { ParentSize } from "@visx/responsive";
import * as React from "react";
import { HierarchicalEdgeBundlingOnClickProps } from "./Common/Graph/HierarchicalEdgeBundling";
import { KeywordHierarchyEdgeBundlingGraph } from "./Graph/KeywordHierarchyEdgeBundlingGraph";
import { Grid, Typography } from "./mui";

export interface KeywordPageContentProps {
  keyword: Keyword.Keyword;
  hierarchicalGraph: HierarchicalEdgeBundlingOnClickProps;
}

export const KeywordPageContent: React.FC<KeywordPageContentProps> = ({
  keyword: { id, tag, color },
  hierarchicalGraph
}) => {
  return (
    <Grid container>
      <Grid item md={1} sm={1} xs={false} />
      <Grid item md={5}>
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
      <Grid item md={5}>
        <ParentSize style={{ maxWidth: 600 }}>
          {({ width }) => {
            return (
              <KeywordHierarchyEdgeBundlingGraph {...hierarchicalGraph} keyword={id} width={width}  />
            );
          }}
        </ParentSize>
      </Grid>
    </Grid>
  );
};
