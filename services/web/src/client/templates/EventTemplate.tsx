import { getRelationIds } from "@liexp/shared/helpers/event";
import { formatDate } from "@liexp/shared/utils/date";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import EventsBox from "@liexp/ui/components/containers/EventsBox";
import { Box, Grid } from "@liexp/ui/components/mui";
import { useEventQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import * as React from "react";
import { queryToHash } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
  const navigateTo = useNavigateToResource();

  return (
    <QueriesRenderer
      loader="fullsize"
      queries={{
        event: useEventQuery({ id: eventId }),
      }}
      render={({ event }) => {
        const relationIds = getRelationIds(event);

        return (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              margin: 20,
              marginBottom: 100,
            }}
          >
            <EventPageContent
              event={event}
              onDateClick={(d) => {
                navigateTo.events({}, { startDate: formatDate(d) });
              }}
              onGroupClick={(g) => {
                navigateTo.groups({ id: g.id });
              }}
              onKeywordClick={(k) => {
                navigateTo.events(
                  {},
                  { hash: queryToHash({ keywords: [k.id] }) }
                );
              }}
              onActorClick={(a) => {
                navigateTo.actors({ id: a.id });
              }}
              onGroupMemberClick={(g) => {
                navigateTo.actors({ id: g.actor.id });
              }}
              onLinkClick={() => {}}
              onAreaClick={(a) => {
                navigateTo.areas({ id: a.id });
              }}
            />

            <Grid container justifyContent="center">
              {relationIds.keywords.length > 0 ? (
                <Grid item md={8} sm={12} xs={12}>
                  <EventsBox
                    title="More events by keywords"
                    query={{
                      keywords: relationIds.keywords,
                      _start: 0,
                      _end: 3,
                      exclude: [event.id],
                    }}
                    onEventClick={(e) => navigateTo.events({ id: e.id })}
                  />
                </Grid>
              ) : null}
              {relationIds.actors.length > 0 ? (
                <Grid item md={8} sm={12} xs={12}>
                  <EventsBox
                    title="More events by actors"
                    query={{
                      actors: relationIds.actors,
                      _start: 0,
                      _end: 3,
                      exclude: [event.id],
                    }}
                    onEventClick={(e) => navigateTo.events({ id: e.id })}
                  />
                </Grid>
              ) : null}
              {relationIds.groups.length > 0 ? (
                <Grid item md={8} sm={12} xs={12}>
                  <EventsBox
                    title="More events by groups"
                    query={{
                      groups: relationIds.groups,
                      _start: 0,
                      _end: 3,
                      exclude: [event.id],
                    }}
                    onEventClick={(e) => navigateTo.events({ id: e.id })}
                  />
                </Grid>
              ) : null}
            </Grid>
          </Box>
        );
      }}
    />
  );
};

export default EventTemplate;
