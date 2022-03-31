import { Page } from "@liexp/shared/io/http";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { usePageContentByPathQuery } from "../state/queries/DiscreteQueries";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import QueriesRenderer from "./QueriesRenderer";
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

export const PageContent: React.FC<{ path: string }> = ({ path }) => {
  return (
    <QueriesRenderer
      queries={{ pageContent: usePageContentByPathQuery({ path }) }}
      render={({ pageContent: { title, path, body } }) => {
        return (
          <div className="page-content" style={{ marginBottom: 100 }}>
            <SEO
              title={title}
              description={body}
              image={`${process.env.PUBLIC_URL}/liexp-logo.png`}
              urlPath={path}
            />
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <MarkdownRenderer>{body}</MarkdownRenderer>
            </ErrorBoundary>
          </div>
        );
      }}
    />
  );
};
