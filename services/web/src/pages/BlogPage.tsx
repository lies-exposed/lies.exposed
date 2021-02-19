import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import { articlesList, pageContentByPath } from "@providers/DataProvider";
import { Link, RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { Block } from "baseui/block";
import { Card, StyledBody } from "baseui/card";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import React from "react";

export default class BlogPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <>
        <SEO title="Blog" />
        <MainContent>
          <WithQueries
            queries={{ pageContent: pageContentByPath }}
            params={{
              pageContent: {
                path: "blog",
              },
            }}
            render={QR.fold(Loader, ErrorBox, ({ pageContent }) => (
              <PageContent {...pageContent} />
            ))}
          />
          <WithQueries
            queries={{ articlesList }}
            params={{
              articlesList: {
                pagination: { page: 1, perPage: 20 },
                sort: { field: "id", order: "DESC" },
                filter: { draft: true },
              },
            }}
            render={QR.fold(
              Loader,
              ErrorBox,
              ({ articlesList: { data: articles } }) => (
                <Block>
                  <FlexGrid flexGridColumnCount={2}>
                    {articles.map((a) => (
                      <FlexGridItem key={a.id}>
                        <Card
                          key={a.id}
                          title={<Link to={`/blog/${a.path}`}>{a.title}</Link>}
                          headerImage={a.featuredImage}
                        >
                          <StyledBody>{a.title}</StyledBody>
                        </Card>
                      </FlexGridItem>
                    ))}
                  </FlexGrid>
                </Block>
              )
            )}
          />
        </MainContent>
      </>
    );
  }
}
