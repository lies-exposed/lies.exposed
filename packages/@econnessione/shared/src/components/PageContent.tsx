/* eslint-disable no-console */
import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Page } from "@io/http";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

export type PageContentProps = Page.Page;

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  console.log(error)
  return (
    <>
      <div>{error.name}</div>
      <div>{error.message}</div>
    </>
  );
};

export const PageContent: React.FC<PageContentProps> = ({ body }) => {
  return (
    <div className="page-content">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </ErrorBoundary>
    </div>
  );
};
