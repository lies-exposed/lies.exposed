import { getEventCommonProps } from "@liexp/shared/helpers/event";
import type * as http from "@liexp/shared/io/http";
import { Quote } from "@liexp/shared/io/http/Events";
import * as React from "react";
import { useTheme } from "../theme";
import { EventRelations } from "./events/EventRelations";
import { DefaultEventPageContent } from "./events/page-content/DefaultEventPageContent";
import { QuoteEventPageContent } from "./events/page-content/QuoteEventPageContent";
import { Box, Grid, Link } from "./mui";

export interface EventPageContentProps {
  event: http.Events.Event;
  onDateClick: (d: Date) => void;
  onActorClick: (a: http.Actor.Actor) => void;
  onGroupClick: (a: http.Group.Group) => void;
  onMediaClick: (m: http.Media.Media) => void;
  onLinkClick: (a: http.Link.Link) => void;
  onKeywordClick: (a: http.Keyword.Keyword) => void;
  onAreaClick: (a: http.Area.Area) => void;
  onGroupMemberClick: (g: http.GroupMember.GroupMember) => void;
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  onDateClick,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
  onLinkClick,
  onAreaClick,
  onMediaClick,
}) => {
  const theme = useTheme();

  return (
    <EventRelations event={event}>
      {({ actors, groups, groupsMembers, media, areas }) => {
        const { url } = getEventCommonProps(event, {
          actors,
          groups: [],
          groupsMembers: [],
          keywords: [],
          media: [],
        });

        const eventPageContent =
          event.type === Quote.QUOTE.value ? (
            <QuoteEventPageContent event={event} actor={actors[0]} />
          ) : (
            <DefaultEventPageContent
              event={event}
              media={media}
              onMediaClick={onMediaClick}
              mediaLayout="masonry"
            />
          );

        return (
          <Box className="event-page-content">
            
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container alignItems="flex-start">
                    <Grid
                      item
                      md={10}
                      sm={12}
                      style={{
                        alignItems: "flex-start",
                        marginBottom: theme.spacing(2),
                      }}
                    >
                      <Box style={{ marginBottom: theme.spacing(3) }}>
                        {url ? <Link href={url}>{url}</Link> : null}

                        <Box
                          onClick={() => {
                            onAreaClick(areas[0]);
                          }}
                        >
                          {areas.length === 1 ? (
                            <span>{areas[0].label}</span>
                          ) : null}
                        </Box>
                      </Box>
                      {eventPageContent}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
          </Box>
        );
      }}
    </EventRelations>
  );
};
