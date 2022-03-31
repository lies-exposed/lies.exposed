import { ArticlePageContent } from "@liexp/ui/components/ArticlePageContent";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import SEO from "@liexp/ui/components/SEO";
import { articleByPath } from "@liexp/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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
          <WithQueries
            queries={{ article: articleByPath }}
            params={{ article: { path: articlePath } }}
            render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ article }) => (
              <>
                <SEO
                  title={article.title}
                  image={article.featuredImage}
                  urlPath={`blog/${article.path}`}
                />
                <ArticlePageContent {...article} />
              </>
            ))}
          />
        )
      )
    );
  }
}
