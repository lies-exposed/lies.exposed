import { getRelationIds } from "@liexp/shared/helpers/event";
import * as http from "@liexp/shared/io/http";
import { formatDateToShort } from "@liexp/shared/utils/date";
import {
  Box,
  Grid,
  Link,
  Typography,
  useMediaQuery as useMuiMediaQuery,
  useTheme,
} from "@material-ui/core";
import * as React from "react";
import { getEventCommonProps } from "../helpers/event.helper";
import {
  useActorsQuery,
  useMediaQuery,
} from "../state/queries/DiscreteQueries";
import { ShareButtons } from "./Common/Button/ShareButtons";
import Editor, { getTextContentsCapped, isValidValue } from "./Common/Editor";
import { GroupMembersBox } from "./GroupMembersBox";
import { GroupsBox } from "./GroupsBox";
import { KeywordsBox } from "./KeywordsBox";
import { LinksBox } from "./LinksBox";
import { MainContent } from "./MainContent";
import QueriesRenderer from "./QueriesRenderer";
import SEO from "./SEO";
import { ActorList } from "./lists/ActorList";
import { MediaSlider } from "./sliders/MediaSlider";

export interface EventPageContentProps {
  event: http.Events.Event;
  onActorClick: (a: http.Actor.Actor) => void;
  onGroupClick: (a: http.Group.Group) => void;
  onGroupMemberClick: (g: http.GroupMember.GroupMember) => void;
  onLinkClick: (a: http.Link.Link) => void;
  onKeywordClick: (a: http.Keyword.Keyword) => void;
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
  onLinkClick,
}) => {
  const theme = useTheme();
  const { actors, groups, groupsMembers, media } = getRelationIds(event);

  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("sm"));

  const date =
    typeof event.date === "string" ? new Date(event.date) : event.date;

  return (
    <QueriesRenderer
      queries={{
        actors: useActorsQuery({
          filter: { ids: actors },
          pagination: {
            perPage: actors.length,
            page: 1,
          },
          sort: {
            field: "fullName",
            order: "DESC",
          },
        }),
        media: useMediaQuery({
          filter: { ids: media },
          pagination: {
            perPage: media.length,
            page: 1,
          },
          sort: {
            field: "createdAt",
            order: "DESC",
          },
        }),
      }}
      render={({ actors: { data: actors }, media: { data: media } }) => {

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

        return (
          <MainContent>
            <SEO
              title={title}
              description={getTextContentsCapped(event.excerpt as any, 230)}
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
                      style={{
                        display: "flex",
                        flexDirection: isDownSM ? "row" : "column",
                      }}
                    >
                      {formatDateToShort(date)
                        .split(" ")
                        .map((chunk, k) => (
                          <Typography
                            key={k}
                            variant="h6"
                            color="primary"
                            style={{ marginBottom: 0 }}
                          >
                            {chunk}
                          </Typography>
                        ))}
                    </Box>

                    <GroupsBox
                      ids={groups}
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

                    <GroupMembersBox
                      ids={groupsMembers}
                      style={{
                        display: "flex",
                        flexDirection: isDownSM ? "row" : "row-reverse",
                      }}
                      onItemClick={onGroupMemberClick}
                    />
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
                    <Typography variant="h3">{title}</Typography>
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

                      <KeywordsBox
                        ids={event.keywords}
                        onItemClick={onKeywordClick}
                      />
                    </Box>

                    <Grid container>
                      <Grid
                        item
                        lg={12}
                        md={12}
                        xs={12}
                        style={{
                          alignContent: "flex-start",
                          marginBottom: theme.spacing(5),
                        }}
                      >
                        {media.length > 0 ? (
                          <MediaSlider
                            data={media}
                            onClick={() => {}}
                            itemStyle={{
                              height: 400,
                              maxWidth: 800,
                              maxHeight: 500,
                              margin: "auto",
                            }}
                          />
                        ) : null}
                      </Grid>
                    </Grid>

                    {isValidValue(event.excerpt) ? (
                      <Editor value={event.excerpt} readOnly={true} />
                    ) : null}
                    {isValidValue(event.body) ? (
                      <Editor value={event.body} readOnly={true} />
                    ) : null}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item md={2} />
                  <Grid item md={10} sm={12} xs={12}>
                    <LinksBox ids={event.links} defaultExpanded={true} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MainContent>
        );
      }}
    />
  );
};
