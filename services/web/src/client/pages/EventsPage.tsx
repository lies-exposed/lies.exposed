import { formatDate } from "@econnessione/shared/utils/date";
import SEO from "@econnessione/ui/components/SEO";
import { Grid } from "@material-ui/core";
import { subYears } from "date-fns";
import * as React from "react";
import { EventsView, useRouteQuery } from "../utils/location.utils";
import { EventsPanel } from "@containers/EventsPanel";

const MIN_DATE = formatDate(subYears(new Date(), 100));
const MAX_DATE = formatDate(new Date());

interface EventsPageProps extends Omit<EventsView, "view"> {}

const EventsPage: React.FC<EventsPageProps> = () => {
  const {
    actors: actorIds = [],
    groups: groupIds = [],
    groupsMembers: groupsMembersIds = [],
    keywords: keywordIds = [],
    startDate = MIN_DATE,
    endDate = MAX_DATE,
    tab = 0,
    hash = "default",
  } = useRouteQuery() as any;

  const filters = {
    startDate,
    endDate,
    keywords: typeof keywordIds === "string" ? [keywordIds] : keywordIds,
    groups: typeof groupIds === "string" ? [groupIds] : groupIds,
    actors: typeof actorIds === "string" ? [actorIds] : actorIds,
    groupsMembers:
      typeof groupsMembersIds === "string"
        ? [groupsMembersIds]
        : groupsMembersIds,
    hash,
    tab: typeof tab === "string" ? parseInt(tab, 10) : tab,
  };

  return (
    <Grid container justifyContent="center" style={{ height: "100%" }}>
      <SEO
        title="lies.exposed - events timeline"
        description="A chronological timeline of events related to crimes and lies."
      />
      {/* <Grid item lg={12} md={12} sm={12}>
        <PageContent queries={{ pageContent: { path: "events" } }} />
      </Grid> */}

      <Grid
        item
        lg={12}
        md={12}
        sm={12}
        style={{ maxWidth: "100%", height: "100%", width: "100%" }}
      >
        <EventsPanel query={{ page: 1, ...filters } as any} />
      </Grid>
    </Grid>
  );
};

export default EventsPage;
