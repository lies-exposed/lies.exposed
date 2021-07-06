import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { ArticlePageContent } from "@econnessione/shared/components/ArticlePageContent";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import SEO from "@econnessione/shared/components/SEO";
import { articleByPath } from "@econnessione/shared/providers/DataProvider";
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
