import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import SEO from "@liexp/ui/lib/components/SEO";
import { Box } from "@liexp/ui/lib/components/mui";
import { useGetMediaQuery } from "@liexp/ui/lib/state/queries/media.queries";
import { MediaTemplateUI } from "@liexp/ui/lib/templates/MediaTemplateUI";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const MediaTemplate: React.FC<{ mediaId: string }> = ({ mediaId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab = "0" } = useRouteQuery();

  return (
    <QueriesRenderer
      queries={{
        media: useGetMediaQuery(mediaId),
      }}
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
            />
          </Box>
        );
      }}
    />
  );
};

export default MediaTemplate;
