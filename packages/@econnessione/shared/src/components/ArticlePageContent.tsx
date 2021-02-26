import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Article } from "@io/http";
import { Grid } from "@material-ui/core";
import { formatDate } from "@utils/date";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { ContentWithSidebar } from "./ContentWithSidebar";
import { MainContent } from "./MainContent";
import { TableOfContents } from "./TableOfContents";
import EditButton from "./buttons/EditButton";

export type ArticlePageContentProps = Article.Article;

export const ArticlePageContent: React.FC<ArticlePageContentProps> = (
  props
) => {
  return (
    <Grid container>
      <Grid
        style={{
          backgroundImage: `url(${props.featuredImage})`,
          backgroundSize: `cover`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <MainContent>
          <h1>{props.title}</h1>
        </MainContent>
      </Grid>
      <Grid>
        <ContentWithSidebar
          sidebar={pipe(
            // props.tableOfContents,
            // O.chainNullableK((t) => t.items),
            O.none,
            O.fold(
              () => <div />,
              (items) => <TableOfContents items={items} />
            )
          )}
        >
          <MainContent>
            <div style={{ textAlign: "right", padding: 10 }}>
              <EditButton resourceName="articles" resource={props} />
            </div>

            <label>{formatDate(props.createdAt)}</label>
            <label>
              {/* Tempo di lettura: {O.getOrElse(() => 1)(props.timeToRead)} min */}
              Tempo di lettura: TODO min
            </label>
          </MainContent>
          <MarkdownRenderer>{props.body}</MarkdownRenderer>
        </ContentWithSidebar>
      </Grid>
    </Grid>
  );
};
