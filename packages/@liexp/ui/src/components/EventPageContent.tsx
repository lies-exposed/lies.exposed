import { getEventCommonProps } from "@liexp/shared/lib/helpers/event";
import type * as http from "@liexp/shared/lib/io/http";
import { Quote } from "@liexp/shared/lib/io/http/Events";
import * as React from "react";
import { useTheme } from "../theme";
import { DefaultEventPageContent } from "./events/page-content/DefaultEventPageContent";
import { QuoteEventPageContent } from "./events/page-content/QuoteEventPageContent";
import { Box, Grid, Link } from "./mui";

export interface EventPageContentProps {
  event: http.Events.Event;
  relations: http.Events.EventRelations;
  onDateClick: (d: Date) => void;
  onActorClick: (a: http.Actor.Actor) => void;
  onGroupClick: (a: http.Group.Group) => void;
  onMediaClick?: (m: http.Media.Media) => void;
  onLinkClick: (a: http.Link.Link) => void;
  onKeywordClick: (a: http.Keyword.Keyword) => void;
  onAreaClick: (a: http.Area.Area) => void;
  onGroupMemberClick: (g: http.GroupMember.GroupMember) => void;
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  relations,
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

  const { url } = getEventCommonProps(event, relations);

  const eventPageContent =
    event.type === Quote.QUOTE.value ? (
      <QuoteEventPageContent event={event} actor={relations.actors[0]} />
    ) : (
      <DefaultEventPageContent
        event={event}
        media={relations.media}
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
                    onAreaClick(relations.areas[0]);
                  }}
                >
                  {relations.areas.length === 1 ? (
                    <span>{relations.areas[0].label}</span>
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
};
