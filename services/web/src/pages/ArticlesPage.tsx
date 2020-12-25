import { ErrorBox } from "@components/Common/ErrorBox"
import { Loader } from "@components/Common/Loader"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { articlesList, pageContent } from "@providers/DataProvider"
import { Link, RouteComponentProps } from "@reach/router"
import * as QR from "avenger/lib/QueryResult"
import { WithQueries } from "avenger/lib/react"
import { Block } from "baseui/block"
import { Card, StyledBody } from "baseui/card"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import React from "react"

export default class ArticlesPage extends React.PureComponent<
  RouteComponentProps
> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ pageContent, articlesList }}
        params={{
          pageContent: {
            id: "blog",
          },
          articlesList: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "DESC" },
            filter: { draft: true },
          },
        }}
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ pageContent, articlesList: articles }) => (
            <>
              <SEO title="Article" />
              <MainContent>
                <PageContent {...pageContent} />
                <Block>
                  <FlexGrid flexGridColumnCount={2}>
                    {articles.map((a) => (
                      <FlexGridItem key={a.id}>
                        <Card
                          key={a.id}
                          title={
                            <Link to={`/blog/${a.frontmatter.path}`}>
                              {a.frontmatter.title}
                            </Link>
                          }
                          headerImage={a.frontmatter.featuredImage}
                        >
                          <StyledBody>{a.frontmatter.title}</StyledBody>
                        </Card>
                      </FlexGridItem>
                    ))}
                  </FlexGrid>
                </Block>
              </MainContent>
            </>
          )
        )}
      />
    )
  }
}
