import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import { useGetMediaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { MediaTemplateUI } from "@liexp/ui/templates/MediaTemplateUI";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
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
              title={m.description}
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
