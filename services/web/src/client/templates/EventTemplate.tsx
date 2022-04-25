import { getRelationIds } from "@liexp/shared/helpers/event";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import {
  useEventQuery,
  useMediaQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { Box, Grid, useTheme } from "@material-ui/core";
import * as React from "react";
import { useParams } from "react-router-dom";
import EventsBox from "../components/events/EventsBox";
import { useNavigateToResource } from "../utils/location.utils";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
  const theme = useTheme();
  const navigateTo = useNavigateToResource();

  return (
    <QueriesRenderer
      loader="fullsize"
      queries={{
        event: useEventQuery({ id: eventId }),
        media: useMediaQuery({
          filter: { events: [eventId] },
          pagination: {
            perPage: 1,
            page: 1,
          },
          sort: {
            field: "createdAt",
            order: "DESC",
          },
        }),
      }}
      render={({ event, media }) => {
        const { actors, groups, keywords } = getRelationIds(event);
        return (
          <Box style={{ margin: 20, marginBottom: 100 }}>
            <EventPageContent
              event={event}
              media={media.data}
              onGroupClick={(g) => {
                navigateTo.groups({ id: g.id });
              }}
              onKeywordClick={(k) => {
                navigateTo.keywords({ id: k.id });
              }}
              onActorClick={(a) => {
                navigateTo.actors({ id: a.id });
              }}
              onGroupMemberClick={(g) => {
                navigateTo.actors({ id: g.actor.id });
              }}
              onLinkClick={() => {}}
            />
            <Box padding={theme.spacing(2)}>
              <Grid container justifyContent="center">
                {keywords.length > 0 ? (
                  <Grid item md={8} sm={12} xs={12}>
                    <EventsBox
                      title="More events by keywords"
                      query={{ keywords, _start: 0, _end: 3, exclude: [event.id] }}
                    />
                  </Grid>
                ) : null}
                {actors.length > 0 ? (
                  <Grid item md={8} sm={12} xs={12}>
                    <EventsBox
                      title="More events by actors"
                      query={{
                        actors,
                        _start: 0,
                        _end: 5,
                        exclude: [event.id],
                      }}
                    />
                  </Grid>
                ) : null}
                {groups.length > 0 ? (
                  <Grid item md={8} sm={12} xs={12}>
                    <EventsBox
                      title="More events by groups"
                      query={{
                        groups,
                        _start: 0,
                        _end: 3,
                        exclude: [event.id],
                      }}
                    />
                  </Grid>
                ) : null}
              </Grid>
            </Box>
          </Box>
        );
      }}
    />
  );
};

export default EventTemplate;
