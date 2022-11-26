import { Article } from "@liexp/shared/io/http";
import { isValidValue } from "@liexp/shared/slate";
import { formatDate } from "@liexp/shared/utils/date";
import * as React from "react";
import { useTheme } from "../theme";
import EditButton from "./Common/Button/EditButton";
import Editor from "./Common/Editor";
import { TOC } from "./Common/TOC";
import { ContentWithSidebar } from "./ContentWithSidebar";
import { MainContent } from "./MainContent";
import { Grid, Typography } from "./mui";

export interface ArticlePageContentProps {
  article: Article.Article;
}

export const ArticlePageContent: React.FC<ArticlePageContentProps> = ({
  article: { featuredImage, ...article },
}) => {
  const theme = useTheme();

  return (
    <Grid container>
      <Grid
        item
        style={{
          backgroundImage: featuredImage
            ? `url(${featuredImage.location})`
            : undefined,
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
          <Typography variant="h1">{article.title}</Typography>
        </MainContent>
      </Grid>
      <Grid container>
        <ContentWithSidebar sidebar={<TOC markdownText={""} />}>
          <MainContent style={{ marginBottom: 40 }}>
            <div style={{ textAlign: "right", padding: 10 }}>
              <EditButton
                admin={true}
                resourceName="articles"
                resource={article}
              />
            </div>
            <Typography className="label">
              {formatDate(article.createdAt)}
            </Typography>{" "}
            <Typography className="label">
              {/* Tempo di lettura: {O.getOrElse(() => 1)(props.timeToRead)} min */}
              Tempo di lettura: TODO min
            </Typography>
            {isValidValue(article.body2) ? (
              <Editor readOnly value={article.body2 as any} />
            ) : null}
          </MainContent>
        </ContentWithSidebar>
      </Grid>
    </Grid>
  );
};
