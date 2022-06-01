import { EventsPanel } from "@containers/EventsPanel";
import { EventType } from "@liexp/shared/io/http/Events";
import { AreaPageContent } from "@liexp/ui/components/AreaPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useAreaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Box } from "@mui/material";
import { subYears } from "date-fns";
import * as React from "react";
import { useRouteQuery } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";

const AreaTemplate: React.FC<{ areaId: string }> = ({ areaId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab = 0 } = useRouteQuery<{ tab?: string }>();

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
              hash={`area-${areaId}`}
              keywords={[]}
              actors={[]}
              groups={[]}
              groupsMembers={[]}
              query={{
                startDate: subYears(new Date(), 1).toDateString(),
                endDate: new Date().toDateString(),
                actors: [],
                groups: [],
                groupsMembers: [],
                keywords: [],
                tab: typeof tab === "string" ? parseInt(tab, 10) : (tab as any),
                type: EventType.types.map((t) => t.value),
                _sort: "createdAt",
                _order: "DESC",
              }}
              onQueryChange={({ tab }) => {
                // navigateToResource.actors({ id: actor.id }, { tab });
              }}
              onQueryClear={() => {}}
            />
          </Box>
        );
      }}
    />
  );
};

export default AreaTemplate;
