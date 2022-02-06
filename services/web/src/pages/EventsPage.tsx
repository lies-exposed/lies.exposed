import { formatDate } from "@econnessione/shared/utils/date";
import { Grid } from "@material-ui/core";
import { subYears } from "date-fns";
import * as React from "react";
import { doUpdateCurrentView, EventsView } from "../utils/location.utils";
import { EventsPanel } from "@containers/EventsPanel";

const MIN_DATE = formatDate(subYears(new Date(), 10));
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
    <Grid container spacing={2} justifyContent="center">
      {/* <Grid item lg={12} md={12} sm={12}>
        <PageContent queries={{ pageContent: { path: "events" } }} />
      </Grid> */}

      <Grid
        item
        lg={12}
        md={12}
        sm={12}
        style={{ margin: 20, maxWidth: "100%" }}
      >
        <Grid item lg={12} md={12} sm={12} xs={12} style={{ maxWidth: "100%" }}>
          <EventsPanel
            view={{
              view: "events",
            }}
            showFilters={true}
            filters={{ page: 1, ...filters, hash, tab }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default EventsPage;
