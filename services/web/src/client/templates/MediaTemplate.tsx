import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { MediaTemplateUI } from "@liexp/ui/lib/templates/MediaTemplateUI.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";

const MediaTemplate: React.FC<{ mediaId: UUID }> = ({ mediaId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const rawQuery = useRouteQuery<Record<string, string | string[]>>();

  const tab = React.useMemo(() => {
    const rawTab = rawQuery.tab;
    return typeof rawTab === "string"
      ? parseInt(rawTab, 10)
      : rawTab !== undefined && rawTab.length > 0
        ? parseInt(rawTab[0], 10)
        : 0;
  }, [rawQuery.tab]);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        media: Q.Media.get.useQuery({ id: mediaId }),
      })}
      render={({ media: { data: m } }) => {
        return (
          <Box>
            <SEO
              title={m.label ?? m.description ?? m.location}
              image={m.thumbnail ?? ""}
              urlPath={`media/${m.id}`}
            />
            <MediaTemplateUI
              media={m}
              tab={tab}
              onTabChange={(t) => {
                navigateToResource.media({ id: m.id }, { tab: String(t) });
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
