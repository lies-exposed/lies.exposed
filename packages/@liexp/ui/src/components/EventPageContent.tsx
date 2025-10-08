import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import type * as http from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useTheme } from "../theme/index.js";
import { BookEventPageContent } from "./events/page-content/BookEventPageContent.js";
import { DefaultEventPageContent } from "./events/page-content/DefaultEventPageContent.js";
import { DocumentaryPageContent } from "./events/page-content/DocumentaryPageContent.js";
import { QuoteEventPageContent } from "./events/page-content/QuoteEventPageContent.js";
import { Box, Grid, Link } from "./mui/index.js";

export interface EventPageContentProps {
  event: http.Events.SearchEvent.SearchEvent;
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
  onDateClick: _onDateClick,
  onActorClick: _onActorClick,
  onGroupClick: _onGroupClick,
  onGroupMemberClick: _onGroupMemberClick,
  onKeywordClick: _onKeywordClick,
  onLinkClick: _onLinkClick,
  onAreaClick,
  onMediaClick,
}) => {
  const theme = useTheme();

  // const { url } = getEventCommonProps(event, relations);
  const link =
    event.type === EVENT_TYPES.DOCUMENTARY
      ? event.payload.website
      : event.type === EVENT_TYPES.SCIENTIFIC_STUDY
        ? event.payload.url
        : event.type === EVENT_TYPES.PATENT
          ? event.payload.source
          : undefined;

  const eventPageContent =
    event.type === EVENT_TYPES.BOOK ? (
      <BookEventPageContent event={event} onMediaClick={onMediaClick} />
    ) : event.type === EVENT_TYPES.QUOTE ? (
      <QuoteEventPageContent event={event} />
    ) : event.type === EVENT_TYPES.DOCUMENTARY ? (
      <DocumentaryPageContent
        event={event}
        media={relations.media[0]}
        onMediaClick={onMediaClick}
      />
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
        <Grid size={{ xs: 12 }}>
          <Grid container alignItems="flex-start">
            <Grid
              size={{ md: 10, sm: 12 }}
              style={{
                alignItems: "flex-start",
                marginBottom: theme.spacing(2),
              }}
            >
              <Box style={{ marginBottom: theme.spacing(3) }}>
                {link ? (
                  <Link href={`/links/${link.id}`}>{link.title}</Link>
                ) : null}

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
