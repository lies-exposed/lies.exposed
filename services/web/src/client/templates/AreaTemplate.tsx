import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import { useAreaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { AreaTemplateUI } from "@liexp/ui/templates/AreaTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";
// import { useNavigateToResource } from "../utils/location.utils";

const AreaTemplate: React.FC<{ areaId: string }> = ({ areaId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab } = useRouteQuery({ tab: 0 });

  return (
    <QueriesRenderer
      queries={{
        area: useAreaQuery({ id: areaId }),
      }}
      render={({ area }) => {
        return (
          <Box>
            <MainContent>
              <SEO
                title={area.label}
                // image={area.avatar ?? ""}
                urlPath={`areas/${area.id}`}
              />
              <AreaTemplateUI
                area={area}
                tab={tab}
                onTabChange={(t) => {
                  navigateToResource.areas({ id: area.id }, { tab: t });
                }}
                onAreaClick={() => {}}
                onEventClick={() => {}}
              />
            </MainContent>
          </Box>
        );
      }}
    />
  );
};

export default AreaTemplate;
