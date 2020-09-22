import { ArticleMarkdownRemark } from "@models/article"
import { formatDate } from "@utils/date"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXXLarge, LabelSmall } from "baseui/typography"
import * as React from "react"
import { ContentWithSidebar } from "./ContentWithSidebar"
import { MainContent } from "./MainContent"
import EditButton from "./buttons/EditButton"

type ArticlePageProps = ArticleMarkdownRemark

export const ArticlePage: React.FC<ArticlePageProps> = (props) => {
  return (
    <>
      <FlexGrid>
        <FlexGridItem
          height="400px"
          display="flex"
          alignItems="end"
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
          <Block>
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
          </Block>
        </FlexGridItem>
      </FlexGrid>
      <ContentWithSidebar
        sidebar={
          <div
            dangerouslySetInnerHTML={{
              __html: props.tableOfContents,
            }}
          />
        }
      >
        <MainContent>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="articles" resource={props.frontmatter} />
          </div>

          <LabelSmall>{formatDate(props.frontmatter.date)}</LabelSmall>
          <LabelSmall>Tempo di lettura: {props.timeToRead} min</LabelSmall>
          {renderHTMLAST(props.htmlAst)}
        </MainContent>
      </ContentWithSidebar>
    </>
  )
}
