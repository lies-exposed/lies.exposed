import { Topic } from "@econnessione/shared/io/http";
import { Grid } from "@material-ui/core";
import * as React from "react";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import EditButton from "./buttons/EditButton";

export interface TopicPageContentProps extends Topic.TopicMD {}

export const TopicPageContent: React.FC<TopicPageContentProps> = ({
  frontmatter,
  body,
}) => {
  return (
    <Grid container>
      <Grid item>
        <div>
          <EditButton resourceName="topics" resource={frontmatter} />
        </div>
        <h1>{frontmatter.label}</h1>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </Grid>
    </Grid>
  );
};
