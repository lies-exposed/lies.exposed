import { formatDate } from "@liexp/shared/utils/date";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { useArticlesQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
  CardMedia,
  Grid
} from "@mui/material";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";

export default class BlogPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {

    return (
      <>
        <MainContent>
          <PageContent path="blog" />
          <QueriesRenderer
            queries={{
              articles: useArticlesQuery({
                pagination: { page: 1, perPage: 20 },
                sort: { field: "id", order: "DESC" },
                filter: { draft: false },
              }),
            }}
            render={({ articles: { data: articles } }) => {
              return (
                <div>
                  <SEO title="Blog" image="" urlPath={`blog`} />
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
            }}
          />
        </MainContent>
      </>
    );
  }
}
