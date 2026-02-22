import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { BNEditor } from "@liexp/ui/lib/components/Common/BlockNote/index.js";
import { TOCPlugin } from "@liexp/ui/lib/components/Common/BlockNote/plugins/renderer/TOCPlugin.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box, Container } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";
import NotFoundPage from "../pages/404.js";

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
              <Container
                maxWidth="lg"
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 2, md: 4 },
                  paddingTop: { xs: 2, md: 4 },
                  paddingBottom: { xs: 2, md: 4 },
                }}
              >
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    width: { md: "20%", lg: "25%" },
                    minWidth: "200px",
                    position: { md: "sticky" },
                    top: { md: "80px" },
                    height: { md: "fit-content" },
                    overflowY: { md: "auto" },
                  }}
                >
                  <TOCPlugin value={m.body2} />
                </Box>
                <MainContent
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <BNEditor content={m.body2} readOnly />
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
