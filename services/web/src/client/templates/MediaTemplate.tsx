import { EventType } from "@liexp/shared/io/http/Events";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import { MediaSlider } from "@liexp/ui/components/sliders/MediaSlider";
import { useMediaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import * as React from "react";
import { useRouteQuery } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";
import { EventsPanel } from "@containers/EventsPanel";

const MediaTemplate: React.FC<{ mediaId: string }> = ({ mediaId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab = 0 } = useRouteQuery<{ tab?: string }>();

  return (
    <QueriesRenderer
      queries={{
        media: useMediaQuery({ filter: { ids: [mediaId] } }, false),
      }}
      render={({ media }) => {
        const m = media.data[0];
        return (
          <Box>
            <MainContent>
              <SEO
                title={m.description}
                image={m.thumbnail ?? ""}
                urlPath={`media/${m.id}`}
              />
              <Box style={{ padding: 10 }}>
                <MediaSlider data={[m]} onClick={() => undefined} />
              </Box>
            </MainContent>
            <EventsPanel
              keywords={[]}
              actors={[]}
              groups={[]}
              slide={false}
              groupsMembers={[]}
              query={{
                hash: `media-${mediaId}`,
                startDate: undefined,
                endDate: new Date().toDateString(),
                media: mediaId ? [mediaId] : [],
                actors: [],
                groups: [],
                groupsMembers: [],
                keywords: [],
                locations: [],
                type: EventType.types.map((t) => t.value),
                _sort: "date",
                _order: "DESC",
              }}
              tab={typeof tab === "string" ? parseInt(tab, 10) : (tab as any)}
              onQueryChange={(q, tab) => {
                navigateToResource.media({ id: m.id }, { tab });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default MediaTemplate;
