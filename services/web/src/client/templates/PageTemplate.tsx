import { isValidValue } from "@liexp/react-page/lib/utils.js";
import { editor } from "@liexp/ui/lib/components/Common/Editor/index.js";
import { TOCPlugin } from "@liexp/ui/lib/components/Common/Editor/plugins/renderer/TOCPlugin.js";
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
                  <editor.LazyEditor
                    value={m.body2}
                    variant="extended"
                    readOnly
                  />
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
