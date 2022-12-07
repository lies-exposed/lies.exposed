import { ArticleCard } from "@liexp/ui/components/articles/ArticleCard";
import { MainContent } from "@liexp/ui/components/MainContent";
import {
  Grid
} from "@liexp/ui/components/mui";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { useArticlesQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const BlogPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <>
      <MainContent>
        <PageContent path="blog" />
        <QueriesRenderer
          queries={{
            articles: useArticlesQuery(
              {
                pagination: { page: 1, perPage: 20 },
                sort: { field: "id", order: "DESC" },
                filter: { draft: false },
              },
              false
            ),
          }}
          render={({ articles: { data: articles } }) => {
            return (
              <div>
                <SEO title="Blog" image="" urlPath={`blog`} />
                <Grid container spacing={2} style={{ marginBottom: 100 }}>
                  {articles.map((a) => (
                    <Grid item key={a.id} xs={6}>
                      <ArticleCard
                        article={a}
                        onClick={(a) => {
                          navigateTo.stories({ path: a.path });
                        }}
                      />
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
};
export default BlogPage;
