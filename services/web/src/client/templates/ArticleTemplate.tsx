import { ArticlePageContent } from "@liexp/ui/components/ArticlePageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { useArticleByPathQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { RouteComponentProps } from "@reach/router";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";

export default class ArticleTemplate extends React.PureComponent<
  RouteComponentProps<{ articlePath: string }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.articlePath),
      O.fold(
        () => <div>Missing project id</div>,
        (articlePath) => (
          <QueriesRenderer
            queries={{ article: useArticleByPathQuery({ path: articlePath }) }}
            render={({ article }) => (
              <>
                <SEO
                  title={article.title}
                  image={article.featuredImage}
                  urlPath={`blog/${article.path}`}
                />
                <ArticlePageContent {...article} />
              </>
            )}
          />
        )
      )
    );
  }
}
