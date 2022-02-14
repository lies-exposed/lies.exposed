import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword
} from "@econnessione/shared/io/http";
import { Link } from "@econnessione/shared/io/http/Link";
import { formatDateToShort } from "@econnessione/shared/utils/date";
import { Box, Grid, Typography, useTheme } from "@material-ui/core";
import * as React from "react";
import { ActorsBox } from "./ActorsBox";
import Editor from "./Common/Editor";
import { GroupMembersBox } from "./GroupMembersBox";
import { GroupsBox } from "./GroupsBox";
import { KeywordsBox } from "./KeywordsBox";
import { LinksBox } from "./LinksBox";
import { MainContent } from "./MainContent";
import SEO from "./SEO";
import { MediaSlider } from "./sliders/MediaSlider";

export interface EventPageContentProps {
  event: Events.Uncategorized.Uncategorized;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (a: Group.Group) => void;
  onGroupMemberClick: (g: GroupMember.GroupMember) => void;
  onLinkClick: (a: Link) => void;
  onKeywordClick: (a: Keyword.Keyword) => void;
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
  return (
    <MainContent>
      <SEO title={event.payload.title} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container alignItems="flex-start">
            <Grid
              item
              md={2}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                paddingRight: 20,
              }}
            >
              {formatDateToShort(event.date)
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

              <GroupsBox
                ids={event.payload.groups}
                style={{ flexDirection: "row-reverse" }}
                onItemClick={onGroupClick}
              />

              <ActorsBox
                ids={event.payload.actors}
                style={{ flexDirection: "row-reverse" }}
                onItemClick={onActorClick}
              />

              <GroupMembersBox
                ids={event.payload.groupsMembers}
                style={{ flexDirection: "row-reverse" }}
                onItemClick={onGroupMemberClick}
              />
            </Grid>

            <Grid item md={10}>
              <Typography variant="h3">{event.payload.title}</Typography>
              <Box>
                <KeywordsBox ids={event.keywords} />
              </Box>

              <Editor value={event.excerpt as any} readOnly={true} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container>
            <Grid item md={2} />
            <Grid item md={10} style={{ marginBottom: theme.spacing(5) }}>
              {event.media.length > 0 ? (
                <MediaSlider
                  ids={event.media}
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
          <Grid container>
            <Grid item md={12} sm={12} xs={12}>
              <Editor value={event.body as any} readOnly={true} />
            </Grid>
            <Grid item md={2} />
            <Grid item md={10} sm={12} xs={12}>
              <LinksBox ids={event.links} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainContent>
  );
};
