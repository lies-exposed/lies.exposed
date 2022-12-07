import { ArticlePageContent } from "@liexp/ui/components/ArticlePageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { useArticleByPathQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import NotFoundPage from "../pages/404";
import ArticlesBox from "@liexp/ui/containers/ArticlesBox";

const ArticleTemplate: React.FC<{ storyPath: string }> = ({ storyPath }) => {
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
              <ArticlePageContent article={{ ...article }} />

              <ArticlesBox params={{}} onClick={() => {}} />
            </>
          )}
        />
      )
    )
  );
};

export default ArticleTemplate;
