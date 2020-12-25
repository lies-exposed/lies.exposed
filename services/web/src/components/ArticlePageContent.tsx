import { Article } from "@econnessione/io"
import { formatDate } from "@utils/date"
import { renderHTML } from "@utils/renderHTML"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXXLarge, LabelSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import EditButton from "./buttons/EditButton"
import { ContentWithSidebar } from "./ContentWithSidebar"
import { MainContent } from "./MainContent"
import { TableOfContents } from "./TableOfContents"

export type ArticlePageContentProps = Article.ArticleMD

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
              backgroundImage: `url(${props.frontmatter.featuredImage})`,
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
            {props.frontmatter.title}
          </HeadingXXLarge>
        </MainContent>
      </FlexGridItem>
      <FlexGridItem>
        <ContentWithSidebar
          sidebar={pipe(
            props.tableOfContents,
            O.mapNullable(t => t.items),
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
                resource={props.frontmatter}
              />
            </div>

            <LabelSmall>{formatDate(props.frontmatter.createdAt)}</LabelSmall>
            <LabelSmall>
              Tempo di lettura: {O.getOrElse(() => 1)(props.timeToRead)} min
            </LabelSmall>
          </MainContent>
          {renderHTML({ body: props.body })}
        </ContentWithSidebar>
      </FlexGridItem>
    </FlexGrid>
  )
}
