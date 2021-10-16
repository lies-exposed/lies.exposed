import { formatDate } from "@econnessione/shared/utils/date";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
  CardMedia,
  Grid,
} from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { doUpdateCurrentView } from "utils/location.utils";

export default class BlogPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    const { navigate } = this.props;

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
            render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ pageContent }) => (
              <PageContent {...pageContent} />
            ))}
          />
          <WithQueries
            queries={{ articles: Queries.Article.getList }}
            params={{
              articles: {
                pagination: { page: 1, perPage: 20 },
                sort: { field: "id", order: "DESC" },
                filter: { draft: false },
              },
            }}
            render={QR.fold(
              LazyFullSizeLoader,
              ErrorBox,
              ({ articles: { data: articles } }) => {
                return (
                  <div>
                    <Grid container spacing={2} style={{ marginBottom: 100 }}>
                      {articles.map((a) => (
                        <Grid item key={a.id} xs={6}>
                          <Card key={a.id}>
                            <CardHeader
                              title={a.title}
                              subheader={
                                <p style={{ fontSize: 11 }}>
                                  {formatDate(a.createdAt)}
                                </p>
                              }
                            />
                            <CardActionArea>
                              <CardMedia
                                component="img"
                                alt="Contemplative Reptile"
                                height="140"
                                image={a.featuredImage}
                                title="Contemplative Reptile"
                              />
                            </CardActionArea>
                            <CardActions>
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => {
                                  void doUpdateCurrentView({
                                    view: "article",
                                    articlePath: a.path,
                                  })();
                                }}
                              >
                                Leggi
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                );
              }
            )}
          />
        </MainContent>
      </>
    );
  }
}
