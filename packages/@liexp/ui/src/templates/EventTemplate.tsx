import { getEventCommonProps } from "@liexp/shared/helpers/event";
import { type http } from "@liexp/shared/io";
import { getTextContentsCapped, isValidValue } from "@liexp/shared/slate";
import { formatAnyDateToShort } from "@liexp/shared/utils/date";
import subYears from "date-fns/subYears";
import * as React from "react";
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
import { EventNetworkGraphBox } from "../containers/graphs/EventNetworkGraphBox";
import { styled, useTheme } from "../theme";
import { SplitPageTemplate } from "./SplitPageTemplate";

const PREFIX = "event-template-ui";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`.${classes.root}`]: {},
  [`.${classes.title}`]: {
    textAlign: "right",
    [theme.breakpoints.down("md")]: {
      textAlign: "left",
    },
  },
}));

export interface EventTemplateProps {
  event: http.Events.Event;
  tab: number;
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
}) => {
  const theme = useTheme();
  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("md"));
  const { date } = event;

  //   const relationIds = getRelationIds(event);

  return (
    <StyledBox className={classes.root}>
      <EventRelations event={event}>
        {({ actors, groups, groupsMembers, media, areas }) => {
          const { title } = getEventCommonProps(event, {
            actors,
            groups: [],
            groupsMembers: [],
            keywords: [],
            media: [],
          });
          const message = isValidValue(event.excerpt)
            ? getTextContentsCapped(event.excerpt, 230)
            : "";
          const seoImage =
            media[0]?.thumbnail ??
            media[0]?.location ??
            `${process.env.PUBLIC_URL}/liexp-logo.png`;

          return (
            <Box>
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
                    label: "Network",
                  },
                  {
                    label: `Links (${event.links.length})`,
                  },
                ]}
                resource={{ name: "events", item: event }}
              >
                <EventPageContent
                  event={event}
                  onDateClick={(d) => {}}
                  onGroupClick={(g) => {}}
                  onKeywordClick={(k) => {}}
                  onActorClick={(a) => {}}
                  onGroupMemberClick={(g) => {}}
                  onLinkClick={() => {}}
                  onAreaClick={(a) => {}}
                  onMediaClick={(m) => {}}
                />
                <Box style={{ height: "600px" }}>
                  <EventNetworkGraphBox
                    type="events"
                    query={{
                      ids: [event.id],
                      startDate: subYears(new Date(), 1).toISOString(),
                    }}
                  />
                </Box>

                <Box
                  style={{
                    display: "flex",
                    height: "100%",
                  }}
                >
                  <LinksListBox
                    filter={{ ids: event.links }}
                    defaultExpanded={true}
                    column={2}
                    onItemClick={() => {}}
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
