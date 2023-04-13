import  { getTextContentsCapped, isValidValue } from "@liexp/shared/lib/slate";
import * as React from "react";
import { usePageContentByPathQuery } from "../state/queries/page.queries";
import Editor from "./Common/Editor";
import QueriesRenderer from "./QueriesRenderer";
import SEO from "./SEO";

export interface PageContentProps {
  path: string;
}

export const PageContent: React.FC<PageContentProps> = ({ path }) => {
  return (
    <QueriesRenderer
      queries={{ pageContent: usePageContentByPathQuery({ path }) }}
      render={({ pageContent: { title, path, excerpt, body2 } }) => {

        return (
          <div className="page-content" style={{ marginBottom: 100 }}>
            <SEO
              title={title}
              description={getTextContentsCapped(
                (excerpt as any) ?? undefined,
                200
              )}
              image={`${process.env.PUBLIC_URL}/liexp-logo.png`}
              urlPath={path}
            />
            {isValidValue(body2) ? <Editor value={body2} readOnly /> : null}
          </div>
        );
      }}
    />
  );
};
