import { ArticleMD } from "@models/article"
import { formatDate } from "@utils/date"
import { renderHTML } from "@utils/renderHTML"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXXLarge, LabelSmall } from "baseui/typography"
import * as React from "react"
import { ContentWithSidebar } from "./ContentWithSidebar"
import { MainContent } from "./MainContent"
import { TableOfContents } from "./TableOfContents"
import EditButton from "./buttons/EditButton"

type ArticlePageProps = ArticleMD

export const ArticlePage: React.FC<ArticlePageProps> = (props) => {
  return (
    <>
      <FlexGrid>
        <FlexGridItem
          height="400px"
          display="flex"
          alignItems="end"
          width="100%"
          overrides={{
            Block: {
              style: {
                backgroundImage: `url(${props.frontmatter.featuredImage.publicURL})`,
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
      </FlexGrid>
      <ContentWithSidebar
        sidebar={
          <TableOfContents {...props.tableOfContents} />
        }
      >
        <MainContent>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="articles" resource={props.frontmatter} />
          </div>

          <LabelSmall>{formatDate(props.frontmatter.date)}</LabelSmall>
          <LabelSmall>Tempo di lettura: {props.timeToRead} min</LabelSmall>
          {renderHTML({ body: props.body })}
        </MainContent>
      </ContentWithSidebar>
    </>
  )
}
