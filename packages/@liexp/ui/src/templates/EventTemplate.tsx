import { TupleWithId } from "@liexp/core/lib/fp/utils/TupleWithId";
import { getEventCommonProps } from "@liexp/shared/lib/helpers/event";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { type http } from "@liexp/shared/lib/io";
import { EventType } from "@liexp/shared/lib/io/http/Events";
import { getTextContentsCapped, isValidValue } from "@liexp/shared/lib/slate";
import {
  formatAnyDateToShort,
  formatDate,
} from "@liexp/shared/lib/utils/date.utils";
import subYears from "date-fns/subYears";
import * as React from "react";
import AreasMap from "../components/AreasMap";
import { EventPageContent } from "../components/EventPageContent";
import { GroupMembersList } from "../components/GroupMembersBox";
import { KeywordsBox } from "../components/KeywordsBox";
import { LinksListBox } from "../components/LinksBox";
import SEO from "../components/SEO";
import { EventRelations } from "../components/events/EventRelations";
import { ActorList } from "../components/lists/ActorList";
import GroupList from "../components/lists/GroupList";
import {
  Box,
  Grid,
  Typography,
  useMediaQuery as useMuiMediaQuery,
} from "../components/mui";
import { EventsFlowGraphBox } from "../containers/graphs/EventsFlowGraphBox";
import { EventNetworkGraphBoxWithFilters } from "../containers/graphs/EventsNetworkGraphBox";
import { styled, useTheme } from "../theme";
import { SplitPageTemplate } from "./SplitPageTemplate";

const PREFIX = "event-template-ui";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    height: "100%",
  },
  [`& .${classes.title}`]: {
    textAlign: "right",
    [theme.breakpoints.down("md")]: {
      textAlign: "left",
    },
  },
}));

export interface EventTemplateProps {
  event: http.Events.Event;
  tab: number;
  filters: {
    actors: string[];
    groups: string[];
    keywords: string[];
    eventType: EventType[];
  };
  onTabChange: (t: number) => void;
  onDateClick: (d: Date) => void;
  onActorClick: (a: http.Actor.Actor) => void;
  onGroupClick: (a: http.Group.Group) => void;
  onMediaClick: (m: http.Media.Media) => void;
  onLinkClick: (a: http.Link.Link) => void;
  onKeywordClick: (a: http.Keyword.Keyword) => void;
  onAreaClick: (a: http.Area.Area) => void;
  onGroupMemberClick: (g: http.GroupMember.GroupMember) => void;
  onEventClick: (e: http.Events.SearchEvent.SearchEvent) => void;
}

export const EventTemplateUI: React.FC<EventTemplateProps> = ({
  event,
  tab,
  onTabChange,
  onDateClick,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
  onEventClick,
  onLinkClick,
  filters,
}) => {
  const theme = useTheme();
  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("md"));
  const { date } = event;

  return (
    <StyledBox className={classes.root}>
      <EventRelations event={event}>
        {({ actors, groups, groupsMembers, media, links, areas }) => {
          const searchEvent = toSearchEvent(event, {
            actors: new Map(actors.map(TupleWithId.of)),
            groups: new Map(groups.map(TupleWithId.of)),
            media: new Map(media.map(TupleWithId.of)),
            links: new Map(links.map(TupleWithId.of)),
            areas: new Map(areas.map(TupleWithId.of)),
          });

          const { title } = getEventCommonProps(event, {
            actors,
            groups,
            groupsMembers: [],
            keywords: [],
            media,
            links,
            areas,
          });
          const message = isValidValue(event.excerpt)
            ? getTextContentsCapped(event.excerpt, 230)
            : "";
          const seoImage =
            media[0]?.thumbnail ??
            media[0]?.location ??
            `${process.env.PUBLIC_URL}/liexp-logo.png`;

          return (
            <Box style={{ height: "100%" }}>
              <SEO
                title={title}
                description={message}
                image={seoImage}
                urlPath={`/events/${event.id}`}
              />
              <SplitPageTemplate
                tab={tab}
                share={{ title, message }}
                aside={
                  <Grid
                    container
                    spacing={2}
                    style={{
                      display: "flex",
                      flexDirection: isDownSM ? undefined : "column",
                      alignItems: isDownSM ? "center" : "flex-end",
                      justifyContent: isDownSM ? "flex-start" : "flex-end",
                      paddingRight: 20,
                    }}
                  >
                    <Grid item lg={12} md={12} sm={2}>
                      <Box
                        className="date"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: isDownSM ? "wrap" : undefined,
                          alignItems: "flex-end",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          onDateClick(date);
                        }}
                      >
                        {formatAnyDateToShort(date)
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
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={10}
                      md={12}
                      lg={12}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isDownSM ? "flex-start" : "flex-end",
                      }}
                    >
                      <Typography
                        className={classes.title}
                        variant="h6"
                        component="h1"
                      >
                        {title}
                      </Typography>
                      {event.keywords.length > 0 ? (
                        <Box style={{ display: "flex", flexDirection: "row" }}>
                          <KeywordsBox
                            ids={event.keywords}
                            onItemClick={onKeywordClick}
                            listStyle={{
                              display: "flex",
                              flexGrow: 1,
                              flexWrap: "wrap",
                              justifyContent: "flex-end",
                            }}
                          />
                        </Box>
                      ) : null}
                    </Grid>
                    {groups.length > 0 ? (
                      <Grid item sm={3} md={12} lg={12}>
                        <GroupList
                          groups={groups.map((g) => ({ ...g, selected: true }))}
                          style={{
                            display: "flex",
                            flexDirection: isDownSM ? "row" : "row-reverse",
                          }}
                          onItemClick={onGroupClick}
                        />
                      </Grid>
                    ) : null}
                    {actors.length > 0 ? (
                      <Grid item sm={3} md={12} lg={12}>
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
                      </Grid>
                    ) : null}
                    {areas.length > 0 ? (
                      <Grid
                        item
                        sm={3}
                        md={12}
                        lg={12}
                        style={{ width: "100%" }}
                      >
                        <Box
                          style={{ width: "100%", height: "100%", padding: 16 }}
                        >
                          <AreasMap
                            areas={areas}
                            height={200}
                            onMapClick={() => {}}
                          />
                        </Box>
                      </Grid>
                    ) : null}
                    {groupsMembers.length > 0 ? (
                      <Grid item sm={3} md={12} lg={12}>
                        <GroupMembersList
                          groupsMembers={groupsMembers}
                          style={{
                            display: "flex",
                            flexDirection: isDownSM ? "row" : "row-reverse",
                          }}
                          onItemClick={onGroupMemberClick}
                        />
                      </Grid>
                    ) : null}
                  </Grid>
                }
                onTabChange={onTabChange}
                tabs={[
                  {
                    label: "General",
                  },
                  {
                    label: "Flow",
                  },
                  {
                    label: "Network",
                  },
                  {
                    label: `Links (${event.links.length})`,
                  },
                ]}
                resource={{ name: "events", item: event }}
              >
                <Grid item lg={8} md={8} sm={12} style={{ height: "100%" }}>
                  <EventPageContent
                    event={searchEvent}
                    relations={{
                      media,
                      links,
                      actors,
                      groups,
                      groupsMembers,
                      keywords: [],
                      areas,
                    }}
                    onDateClick={onDateClick}
                    onGroupClick={onGroupClick}
                    onKeywordClick={onKeywordClick}
                    onActorClick={onActorClick}
                    onGroupMemberClick={(g) => {}}
                    onLinkClick={() => {}}
                    onAreaClick={(a) => {}}
                  />
                </Grid>

                <EventsFlowGraphBox
                  type="events"
                  id={event.id}
                  query={{}}
                  onEventClick={onEventClick}
                />

                <Box style={{ height: "100%" }}>
                  <EventNetworkGraphBoxWithFilters
                    type="events"
                    onActorClick={onActorClick}
                    onEventClick={onEventClick}
                    onGroupClick={onGroupClick}
                    selectedActorIds={filters.actors}
                    selectedGroupIds={filters.groups}
                    selectedKeywordIds={filters.keywords}
                    query={{
                      ids: [event.id],
                      eventType: EventType.types.map((t) => t.value),
                      startDate: formatDate(subYears(new Date(), 1)),
                      endDate: formatDate(new Date()),
                    }}
                    onQueryChange={() => {}}
                  />
                </Box>

                <Box
                  style={{
                    display: "flex",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <LinksListBox
                    filter={{ ids: event.links }}
                    defaultExpanded={true}
                    column={2}
                    onItemClick={onLinkClick}
                  />
                </Box>
              </SplitPageTemplate>
            </Box>
          );
        }}
      </EventRelations>
    </StyledBox>
  );
};
