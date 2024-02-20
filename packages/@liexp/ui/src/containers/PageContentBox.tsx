import {
  getTextContentsCapped,
  isValidValue,
} from "@liexp/shared/lib/slate/index.js";
import * as React from "react";
import { LazyEditor as Editor } from "../components/Common/Editor/index.js";
import { TOCPlugin } from "../components/Common/Editor/plugins/renderer/TOCPlugin.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import SEO from "../components/SEO.js";
import { Typography } from "../components/mui/index.js";
import { useConfiguration } from "../context/ConfigurationContext.js";

export interface PageContentProps {
  path: string;
  showTitle?: boolean;
  style?: React.CSSProperties;
}

export const PageContentBox: React.FC<PageContentProps> = ({
  path,
  showTitle = false,
  style,
}) => {
  const conf = useConfiguration();
  return (
    <QueriesRenderer
      queries={(Q) => ({
        pageContent: Q.Page.Custom.GetPageContentByPath.useQuery(path),
      })}
      render={({ pageContent: { title, path, excerpt, body2 } }) => {
        return (
          <div className="page-content" style={style}>
            <SEO
              title={title}
              description={getTextContentsCapped(
                (excerpt as any) ?? undefined,
                200,
              )}
              image={`${conf.publicUrl}/liexp-logo.png`}
              urlPath={path}
            />
            {showTitle ? (
              <Typography variant="h3" component={"h1"}>
                {title}
              </Typography>
            ) : null}
            {isValidValue(body2) ? <Editor value={body2} readOnly /> : null}
            {isValidValue(body2) ? <TOCPlugin value={body2} /> : null}
          </div>
        );
      }}
    />
  );
};
