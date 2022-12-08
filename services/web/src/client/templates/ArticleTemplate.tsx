import { ArticlePageContent } from "@liexp/ui/components/ArticlePageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import ArticlesBox from "@liexp/ui/containers/ArticlesBox";
import { useArticleByPathQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import NotFoundPage from "../pages/404";
import { useNavigateToResource } from "../utils/location.utils";

const ArticleTemplate: React.FC<{ storyPath: string }> = ({ storyPath }) => {
  const navigateTo = useNavigateToResource();
  return pipe(
    O.fromNullable(storyPath),
    O.fold(
      () => <NotFoundPage />,
      (articlePath) => (
        <QueriesRenderer
          queries={{ article: useArticleByPathQuery({ path: articlePath }) }}
          render={({ article }) => (
            <>
              <SEO
                title={article.title}
                image={article.featuredImage?.location}
                urlPath={`blog/${article.path}`}
              />
              <ArticlePageContent
                article={{ ...article }}
                onKeywordClick={(k) => {
                  navigateTo.keywords({ id: k.id });
                }}
              />

              <ArticlesBox
                params={{
                  pagination: {
                    perPage: 3,
                    page: 1,
                  },
                  sort: { field: "updatedAt", order: "DESC" },
                  filter: {
                    draft: false,
                    exclude: [article.id],
                  },
                }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "2rem",
                }}
                onItemClick={(a) => {
                  navigateTo.stories({ path: a.path });
                }}
              />
            </>
          )}
        />
      )
    )
  );
};

export default ArticleTemplate;
