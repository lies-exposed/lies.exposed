import { ArticlePageContent } from "@components/ArticlePageContent";
import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { MainContent } from "@components/MainContent";
import SEO from "@components/SEO";
import { article, articleByPath } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { FlexGridItem } from "baseui/flex-grid";
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
            render={QR.fold(Loader, ErrorBox, ({ article }) => (
              <FlexGridItem display="flex">
                <SEO title={article.title} />
                <ArticlePageContent {...article} />
              </FlexGridItem>
            ))}
          />
        )
      )
    );
  }
}
