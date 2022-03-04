import { formatDate } from "@liexp/shared/utils/date";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { navigateTo } from "@liexp/ui/utils/links.utils";
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

export default class BlogPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    const { navigate } = this.props;

    return (
      <>
        <SEO title="Blog" image="" />
        <MainContent>
          <PageContent
            queries={{
              pageContent: {
                path: "blog",
              },
            }}
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
                                  // navigateTo.articles({
                                  //   articlePath: a.path,
                                  // });
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
