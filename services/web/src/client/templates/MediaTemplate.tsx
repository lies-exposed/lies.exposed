import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { MediaTemplateUI } from "@liexp/ui/lib/templates/MediaTemplateUI.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const MediaTemplate: React.FC<{ mediaId: string }> = ({ mediaId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab = "0" } = useRouteQuery();

  return (
    <QueriesRenderer
      queries={(Q) => ({
        media: Q.Media.get.useQuery({ id: mediaId }),
      })}
      render={({ media: m }) => {
        return (
          <Box>
            <SEO
              title={m.label ?? m.description ?? m.location}
              image={m.thumbnail ?? ""}
              urlPath={`media/${m.id}`}
            />
            <MediaTemplateUI
              media={m}
              tab={parseInt(tab, 10)}
              onTabChange={(t) => {
                navigateToResource.media({ id: m.id }, { tab: t });
              }}
              onEventClick={(e) => {
                navigateToResource.events({ id: e.id });
              }}
              onKeywordClick={(k) => {
                navigateToResource.keywords({ id: k.id });
              }}
              onMediaClick={(m) => {
                navigateToResource.media({ id: m.id });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default MediaTemplate;
