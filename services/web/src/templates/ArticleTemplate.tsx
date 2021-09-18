import { articleByPath } from "@econnessione/shared/providers/DataProvider";
import { ArticlePageContent } from "@econnessione/ui/components/ArticlePageContent";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import SEO from "@econnessione/ui/components/SEO";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
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
                <SEO title={article.title} />
                <ArticlePageContent {...article} />
              </>
            ))}
          />
        )
      )
    );
  }
}
