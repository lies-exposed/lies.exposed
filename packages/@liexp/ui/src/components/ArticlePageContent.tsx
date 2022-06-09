import { Article } from "@liexp/shared/io/http";
import { formatDate } from "@liexp/shared/utils/date";
import * as React from "react";
import { useTheme } from "../theme";
import EditButton from "./Common/Button/EditButton";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import { TOC } from "./Common/TOC";
import { ContentWithSidebar } from "./ContentWithSidebar";
import { MainContent } from "./MainContent";
import { Grid, Typography } from "./mui";

export type ArticlePageContentProps = Article.Article;

export const ArticlePageContent: React.FC<ArticlePageContentProps> = (
  props
) => {
  const theme = useTheme();
  return (
    <Grid container>
      <Grid
        item
        style={{
          backgroundImage: `url(${props.featuredImage})`,
          backgroundSize: `cover`,
          backgroundRepeat: "no-repeat",
          width: "100%",
          height: "100%",
          minHeight: 300,
        }}
      >
        <MainContent
          style={{
            paddingTop: 40,
            paddingBottom: 40,
            backgroundColor: `${theme.palette.secondary.main}40`,
            margin: "30px auto",
          }}
        >
          <Typography variant="h1">{props.title}</Typography>
        </MainContent>
      </Grid>
      <Grid container>
        <ContentWithSidebar sidebar={<TOC markdownText={props.body} />}>
          <MainContent style={{ marginBottom: 40 }}>
            <div style={{ textAlign: "right", padding: 10 }}>
              <EditButton resourceName="articles" resource={props} />
            </div>
            <Typography className="label">
              {formatDate(props.createdAt)}
            </Typography>{" "}
            <Typography className="label">
              {/* Tempo di lettura: {O.getOrElse(() => 1)(props.timeToRead)} min */}
              Tempo di lettura: TODO min
            </Typography>
          </MainContent>
          <MarkdownRenderer>{props.body}</MarkdownRenderer>
        </ContentWithSidebar>
      </Grid>
    </Grid>
  );
};
