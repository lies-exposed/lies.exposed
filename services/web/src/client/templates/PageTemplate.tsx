import { isValidValue } from "@liexp/shared/lib/slate";
import { LazyEditor as Editor } from "@liexp/ui/lib/components/Common/Editor";
import { TOCPlugin } from "@liexp/ui/lib/components/Common/Editor/plugins/renderer/TOCPlugin";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import SEO from "@liexp/ui/lib/components/SEO";
import { Box, Container } from "@liexp/ui/lib/components/mui";
import * as React from "react";
import NotFoundPage from "../pages/404";

const PageTemplate: React.FC<{ customPath: string }> = ({ customPath }) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        page: Q.Page.Custom.GetPageContentByPath.useQuery(customPath),
      })}
      render={({ page: m }) => {
        return (
          <Box>
            <SEO title={m.title} image={""} urlPath={m.path} />
            {isValidValue(m.body2) ? (
              <Container style={{ display: "flex" }}>
                <TOCPlugin value={m.body2} />
                <MainContent>
                  <Editor value={m.body2} readOnly />
                </MainContent>
              </Container>
            ) : (
              <NotFoundPage />
            )}
          </Box>
        );
      }}
    />
  );
};

export default PageTemplate;
