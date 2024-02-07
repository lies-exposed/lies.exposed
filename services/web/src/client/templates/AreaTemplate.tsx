import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { AreaTemplateUI } from "@liexp/ui/lib/templates/AreaTemplate";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const AreaTemplate: React.FC<{ areaId: string }> = ({ areaId }) => {
  const navigateToResource = useNavigateToResource();
  const { tab: _tab = "0" } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        area: Q.Area.get.useQuery({ id: areaId }),
      })}
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
              onEventClick={(e) => {
                navigateToResource.events({ id: e.id });
              }}
              onMediaClick={(m) => {
                navigateToResource.media({ id: m.id }, { tab: 0 });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default AreaTemplate;
