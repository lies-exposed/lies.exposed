/* eslint-disable no-console */
import { Page } from "@econnessione/shared/io/http";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";

export type PageContentProps = Page.Page;

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  console.log(error);
  return (
    <>
      <div>{error.name}</div>
      <div>{error.message}</div>
    </>
  );
};

export const PageContent: React.FC<PageContentProps> = ({ body }) => {
  return (
    <div className="page-content" style={{ marginBottom: 100 }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </ErrorBoundary>
    </div>
  );
};
