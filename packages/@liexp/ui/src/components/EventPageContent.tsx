import * as http from "@liexp/shared/io/http";
import { Quote } from "@liexp/shared/io/http/Events";
import { getTextContentsCapped, isValidValue } from "@liexp/shared/slate";
import { formatDateToShort } from "@liexp/shared/utils/date";
import * as React from "react";
import { getEventCommonProps } from "../helpers/event.helper";
import { useTheme } from "../theme";
import EditButton from "./Common/Button/EditButton";
import { ShareButtons } from "./Common/Button/ShareButtons";
import { GroupMembersList } from "./GroupMembersBox";
import { KeywordsBox } from "./KeywordsBox";
import { LinksBox } from "./LinksBox";
import { MainContent } from "./MainContent";
import SEO from "./SEO";
import { EventRelations } from "./events/EventRelations";
import { DefaultEventPageContent } from "./events/page-content/DefaultEventPageContent";
import { QuoteEventPageContent } from "./events/page-content/QuoteEventPageContent";
import { ActorList } from "./lists/ActorList";
import GroupList from "./lists/GroupList";
import {
  Box,
  Grid,
  Link,
  Typography,
  useMediaQuery as useMuiMediaQuery,
} from "./mui";

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
  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("md"));
  const { date } = event;
  return (
    <EventRelations event={event}>
      {({ actors, groups, groupsMembers, media, areas }) => {
        const { title, url } = getEventCommonProps(event, {
          actors,
          groups: [],
          groupsMembers: [],
          keywords: [],
          media: [],
        });

        const seoImage =
          media[0]?.thumbnail ??
          media[0]?.location ??
          `${process.env.PUBLIC_URL}/liexp-logo.png`;

        const eventPageContent =
          event.type === Quote.QUOTE.value ? (
            <QuoteEventPageContent event={event} actor={actors[0]} />
          ) : (
            <DefaultEventPageContent
              event={event}
              media={media}
              onMediaClick={onMediaClick}
            />
          );

        return (
          <MainContent className="event-page-content">
            <SEO
              title={title}
              description={
                isValidValue(event.excerpt)
                  ? getTextContentsCapped(event.excerpt, 230)
                  : ""
              }
              image={seoImage}
              urlPath={`/events/${event.id}`}
            />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container alignItems="flex-start">
                  <Grid
                    item
                    md={2}
                    sm={12}
                    style={{
                      display: "flex",
                      flexDirection: isDownSM ? "row" : "column",
                      alignItems: isDownSM ? "center" : "flex-end",
                      justifyContent: isDownSM ? "flex-start" : "flex-end",
                      paddingRight: 20,
                    }}
                  >
                    <Box
                      className="date"
                      style={{
                        display: "flex",
                        flexDirection: isDownSM ? "row" : "column",
                        flexGrow: isDownSM ? 1 : 0,
                        alignItems: "flex-end",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        onDateClick(date);
                      }}
                    >
                      {formatDateToShort(date)
                        .split(" ")
                        .map((chunk, k) => (
                          <Typography
                            key={k}
                            variant="h6"
                            color="primary"
                            style={{
                              marginBottom: 0,
                              marginLeft: k > 0 ? theme.spacing(1) : 0,
                            }}
                          >
                            {chunk}
                          </Typography>
                        ))}
                    </Box>

                    <GroupList
                      groups={groups.map((g) => ({ ...g, selected: true }))}
                      style={{
                        display: "flex",
                        flexDirection: isDownSM ? "row" : "row-reverse",
                      }}
                      onItemClick={onGroupClick}
                    />

                    <ActorList
                      actors={actors.map((a) => ({ ...a, selected: true }))}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        flexDirection: isDownSM ? "row" : "row-reverse",
                        maxWidth: "100%",
                      }}
                      onActorClick={onActorClick}
                    />

                    <GroupMembersList
                      groupsMembers={groupsMembers}
                      style={{
                        display: "flex",
                        flexDirection: isDownSM ? "row" : "row-reverse",
                      }}
                      onItemClick={onGroupMemberClick}
                    />
                    <Box>
                      <EditButton
                        admin={false}
                        resourceName="events/suggestions"
                        resource={{ id: event.id }}
                      />
                    </Box>
                  </Grid>

                  <Grid
                    item
                    md={10}
                    sm={12}
                    style={{
                      alignItems: "flex-start",
                      marginBottom: theme.spacing(2),
                    }}
                  >
                    <Typography variant="h4">{title}</Typography>
                    <Box style={{ marginBottom: theme.spacing(3) }}>
                      <ShareButtons
                        urlPath={`/events/${event.id}`}
                        title={title}
                        message={
                          isValidValue(event.excerpt)
                            ? getTextContentsCapped(event.excerpt, 100)
                            : ""
                        }
                        keywords={[]}
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          marginBottom: theme.spacing(2),
                        }}
                      />
                      {url ? <Link href={url}>{url}</Link> : null}

                      <Box style={{ display: "flex", flexDirection: "row" }}>
                        <KeywordsBox
                          ids={event.keywords}
                          onItemClick={onKeywordClick}
                          style={{
                            display: "flex",
                            flexGrow: 1,
                          }}
                        />
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
                    </Box>
                    {eventPageContent}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item md={2} />
                  <Grid item md={10} sm={12} xs={12}>
                    <LinksBox
                      ids={event.links}
                      defaultExpanded={true}
                      onClick={onLinkClick}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MainContent>
        );
      }}
    </EventRelations>
  );
};
