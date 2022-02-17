import { EventsPanel } from "@containers/EventsPanel";
import { formatDate } from "@econnessione/shared/utils/date";
import SEO from "@econnessione/ui/components/SEO";
import { Grid } from "@material-ui/core";
import { subYears } from "date-fns";
import * as React from "react";
import { EventsView } from "../utils/location.utils";

const MIN_DATE = formatDate(subYears(new Date(), 100));
const MAX_DATE = formatDate(new Date());

interface EventsPageProps extends EventsView {}

const EventsPage: React.FC<EventsPageProps> = ({
  actors: actorIds = [],
  groups: groupIds = [],
  groupsMembers: groupsMembersIds = [],
  keywords: keywordIds = [],
  startDate = MIN_DATE,
  endDate = MAX_DATE,
  tab = 0,
  hash = "default",
}) => {
  const filters = {
    startDate,
    endDate,
    keywords: keywordIds,
    groups: groupIds,
    actors: actorIds,
    groupsMembers: groupsMembersIds,
    hash,
    tab,
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
        <EventsPanel
          view={{
            view: "events",
          }}
          showFilters={true}
          filters={{ page: 1, ...filters, hash, tab }}
        />
      </Grid>
    </Grid>
  );
};

export default EventsPage;
