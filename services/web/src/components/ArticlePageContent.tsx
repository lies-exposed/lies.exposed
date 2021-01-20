import { Article } from "@econnessione/shared/lib/io/http";
import { formatDate } from "@utils/date";
import { RenderHTML } from "@utils/renderHTML";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { HeadingXXLarge, LabelSmall } from "baseui/typography";
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
    <FlexGrid width="100%">
      <FlexGridItem
        height="400px"
        display="flex"
        alignItems="end"
        width="100%"
        overrides={{
          Block: {
            style: {
              backgroundImage: `url(${props.featuredImage})`,
              backgroundSize: `cover`,
              backgroundRepeat: "no-repeat",
            },
          },
        }}
      >
        <MainContent>
          <HeadingXXLarge
            $style={{
              background: `rgba(255, 255, 255, 0.5)`,
              width: "100%",
            }}
            width="100%"
          >
            {props.title}
          </HeadingXXLarge>
        </MainContent>
      </FlexGridItem>
      <FlexGridItem>
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
              <EditButton
                resourceName="articles"
                resource={props}
              />
            </div>

            <LabelSmall>{formatDate(props.createdAt)}</LabelSmall>
            <LabelSmall>
              {/* Tempo di lettura: {O.getOrElse(() => 1)(props.timeToRead)} min */}
              Tempo di lettura: TODO min
            </LabelSmall>
          </MainContent>
          {RenderHTML({ children: props.body })}
        </ContentWithSidebar>
      </FlexGridItem>
    </FlexGrid>
  );
};
