import { type Article } from "@liexp/shared/lib/io/http";
import { type Keyword } from "@liexp/shared/lib/io/http/Keyword";
import { isValidValue } from "@liexp/shared/lib/slate";
import { formatDate } from "@liexp/shared/lib/utils/date";
import { parseISO } from "date-fns";
import * as t from "io-ts";
import * as React from "react";
import { useTheme } from "../theme";
import EditButton from "./Common/Button/EditButton";
import Editor from "./Common/Editor";
import { KeywordsBox } from "./KeywordsBox";
import { MainContent } from "./MainContent";
import { alpha, Grid, Typography } from "./mui";

export interface ArticlePageContentProps {
  article: Article.Article;
  onKeywordClick: (k: Keyword) => void;
}

export const ArticlePageContent: React.FC<ArticlePageContentProps> = ({
  article: { featuredImage, ...article },
  onKeywordClick,
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
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          minHeight: 300,
        }}
      >
        <MainContent
          style={{
            paddingTop: 40,
            paddingBottom: 40,
            backgroundColor: `${alpha(theme.palette.common.white, 0.8)}`,
            margin: "30px auto",
          }}
        >
          <Typography variant="h1" style={{ fontSize: "3rem" }}>
            {article.title}
          </Typography>
          <KeywordsBox ids={article.keywords} onItemClick={onKeywordClick} />
        </MainContent>
      </Grid>
      <Grid container>
        <MainContent style={{ marginBottom: 40 }}>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton
              admin={true}
              resourceName="articles"
              resource={article}
            />
          </div>
          <div style={{ marginBottom: 50 }}>
            <Typography className="label" style={{}}>
              {formatDate(
                t.string.is(article.createdAt)
                  ? parseISO(article.createdAt)
                  : article.createdAt
              )}
            </Typography>{" "}
            {/* <Typography className="label">
              {/* Tempo di lettura: {O.getOrElse(() => 1)(props.timeToRead)} min
              Tempo di lettura: TODO min
            </Typography> */}
          </div>

          {isValidValue(article.body2) ? (
            <Editor readOnly value={article.body2 as any} />
          ) : null}
        </MainContent>
      </Grid>
    </Grid>
  );
};
