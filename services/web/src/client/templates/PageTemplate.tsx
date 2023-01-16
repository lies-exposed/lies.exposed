import { isValidValue } from "@liexp/shared/slate";
import Editor from "@liexp/ui/components/Common/Editor";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box, Container } from "@liexp/ui/components/mui";
import { usePageContentByPathQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import * as React from "react";
import NotFoundPage from "../pages/404";

const PageTemplate: React.FC<{ customPath: string }> = ({ customPath }) => {
  return (
    <QueriesRenderer
      queries={{
        page: usePageContentByPathQuery({ path: customPath }),
      }}
      render={({ page: m }) => {
        return (
          <Box>
            <SEO title={m.title} image={""} urlPath={m.path} />
            {isValidValue(m.body2) ? (
              <Container>
                <Editor value={m.body2} readOnly />
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
