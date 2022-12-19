import { EventType } from "@liexp/shared/io/http/Events";
import EditButton from "@liexp/ui/components/Common/Button/EditButton";
import { KeywordsBox } from "@liexp/ui/components/KeywordsBox";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box, Typography } from "@liexp/ui/components/mui";
import { MediaSlider } from "@liexp/ui/components/sliders/MediaSlider";
import { useGetMediaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
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
        media: useGetMediaQuery(mediaId),
      }}
      render={({ media: m }) => {
        return (
          <Box>
            <MainContent>
              <SEO
                title={m.description}
                image={m.thumbnail ?? ""}
                urlPath={`media/${m.id}`}
              />
              <EditButton resourceName="media" resource={m} admin={true} />
              <Box style={{ padding: 10 }}>
                <MediaSlider data={[m]} onClick={() => undefined} />
                <Typography>{m.description}</Typography>
                <KeywordsBox
                  ids={m.keywords}
                  onItemClick={(k) => {
                    navigateToResource.keywords(
                      { id: k.id },
                    );
                  }}
                />
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
