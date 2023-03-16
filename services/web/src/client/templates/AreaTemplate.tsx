import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import { useAreaQuery } from "@liexp/ui/state/queries/area.queries";
import { AreaTemplateUI } from "@liexp/ui/templates/AreaTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const AreaTemplate: React.FC<{ areaId: string }> = ({ areaId }) => {
  const navigateToResource = useNavigateToResource();
  const { tab: _tab = "0" } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      queries={{
        area: useAreaQuery({ id: areaId }),
      }}
      render={({ area }) => {
        return (
          <Box style={{ width: "100%", height: "100%" }}>
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
          </Box>
        );
      }}
    />
  );
};

export default AreaTemplate;
