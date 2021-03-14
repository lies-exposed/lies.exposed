import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { ArticlePageContent } from "@econnessione/shared/components/ArticlePageContent";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { MainContent } from "@econnessione/shared/components/MainContent";
import SEO from "@econnessione/shared/components/SEO";
import {
  article,
  articleByPath,
} from "@econnessione/shared/providers/DataProvider";
import { Grid } from "@material-ui/core";
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
    // eslint-disable-next-line
    console.log(this.props);

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
