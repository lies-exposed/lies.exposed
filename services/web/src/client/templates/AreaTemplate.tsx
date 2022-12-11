import { EventType } from "@liexp/shared/io/http/Events";
import { AreaPageContent } from "@liexp/ui/components/AreaPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { Box } from "@liexp/ui/components/mui";
import { EventsPanel } from "@liexp/ui/containers/EventsPanel";
import { useAreaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import { subYears } from "date-fns";
import * as React from "react";
// import { useNavigateToResource } from "../utils/location.utils";

const AreaTemplate: React.FC<{ areaId: string }> = ({ areaId }) => {
  // const params = useParams();
  // const navigateToResource = useNavigateToResource();
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
              {/* <SEO
                title={area.label}
                image={actor.avatar ?? ""}
                urlPath={`actors/${actor.id}`}
              /> */}
              <AreaPageContent area={area} onGroupClick={() => {}} />
            </MainContent>
            <EventsPanel
              slide={false}
              keywords={[]}
              actors={[]}
              groups={[]}
              groupsMembers={[]}
              query={{
                hash: `area-${areaId}`,
                startDate: subYears(new Date(), 1).toDateString(),
                endDate: new Date().toDateString(),
                actors: [],
                groups: [],
                groupsMembers: [],
                media: [],
                keywords: [],
                locations: [areaId],
                type: EventType.types.map((t) => t.value),
                _sort: "createdAt",
                _order: "DESC",
              }}
              tab={typeof tab === "string" ? parseInt(tab, 10) : (tab as any)}
              onQueryChange={(q, tab) => {
                // navigateToResource.area({ id: actor.id }, { tab });
              }}
              onEventClick={(e) => {}}
            />
          </Box>
        );
      }}
    />
  );
};

export default AreaTemplate;
