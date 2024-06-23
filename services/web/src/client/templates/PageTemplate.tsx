import { BNEditor } from "@liexp/ui/lib/components/Common/BlockNote/index.js";
import { TOCPlugin } from "@liexp/ui/lib/components/Common/BlockNote/plugins/renderer/TOCPlugin.js";
import { isValidValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/index.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box, Container } from "@liexp/ui/lib/components/mui/index.js";
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
                  <BNEditor content={m.body2 as any} readOnly />
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
