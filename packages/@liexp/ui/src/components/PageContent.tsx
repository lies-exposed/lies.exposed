import { Page } from "@liexp/shared/io/http";
import * as QR from "avenger/lib/QueryResult";
import { declareQueries } from "avenger/lib/react";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { pageContentByPath } from "../providers/DataProvider";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import SEO from "./SEO";

export type PageContentProps = Page.Page;

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  // eslint-disable-next-line
  console.log(error);
  return (
    <>
      <div>{error.name}</div>
      <div>{error.message}</div>
    </>
  );
};
const withQueries = declareQueries({ pageContent: pageContentByPath });

export const PageContent = withQueries(({ queries }): React.ReactElement => {
  return pipe(
    queries,
    QR.fold(
      LazyFullSizeLoader,
      ErrorBox,
      ({ pageContent: { title, path, body } }) => {
        return (
          <div className="page-content" style={{ marginBottom: 100 }}>
            <SEO
              title={title}
              description={body}
              image={`${process.env.PUBLIC_URL}liexp-logo.png`}
              urlPath={path}
            />
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <MarkdownRenderer>{body}</MarkdownRenderer>
            </ErrorBoundary>
          </div>
        );
      }
    )
  );
});
