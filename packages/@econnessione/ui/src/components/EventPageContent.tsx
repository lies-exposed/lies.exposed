import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
} from "@econnessione/shared/io/http";
import { Link } from "@econnessione/shared/io/http/Link";
import { formatDate } from "@econnessione/shared/utils/date";
import { Grid, Typography, useTheme } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { ActorsBox } from "./ActorsBox";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import { Slider } from "./Common/Slider/Slider";
import { GroupMembersBox } from "./GroupMembersBox";
import { GroupsBox } from "./GroupsBox";
import { KeywordsBox } from "./KeywordsBox";
import { LinksBox } from "./LinksBox";
import { MainContent } from "./MainContent";
import SEO from "./SEO";

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
      <SEO title={event.title} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container alignItems="center">
            <Grid item md={2}>
              <Typography
                variant="h5"
                color="secondary"
                display="inline"
                style={{ marginRight: 10 }}
              >
                {formatDate(event.startDate)}
              </Typography>
            </Grid>
            <Grid item md={10}>
              <Typography variant="h3">{event.title}</Typography>
              <Typography variant="subtitle1">{event.excerpt}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="flex-start" alignContent="flex-start">
            <Grid item md={3}>
              <KeywordsBox ids={event.keywords} />
            </Grid>
            <Grid item md={3} xs={6}>
              <GroupsBox ids={event.groups} onItemClick={onGroupClick} />
            </Grid>
            <Grid item md={3} xs={6} style={{ marginBottom: 30 }}>
              <ActorsBox ids={event.actors} onItemClick={onActorClick} />
            </Grid>
            <Grid item md={3} xs={6} style={{ marginBottom: 30 }}>
              <GroupMembersBox
                ids={event.groupsMembers}
                onItemClick={onGroupMemberClick}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={12} style={{ marginBottom: theme.spacing(5) }}>
          {pipe(
            event.media,
            O.fromPredicate((items) => items.length > 0),
            O.map((media) => (
              <Slider
                key="home-slider"
                slides={media.map((i) => ({
                  authorName: "",
                  info: i.description,
                  src: i.location,
                  type: i.type,
                }))}
                arrows={false}
                dots={true}
              />
            )),
            O.toNullable
          )}
        </Grid>

        <Grid item md={12} sm={12} xs={12}>
          <MarkdownRenderer>{event.body2}</MarkdownRenderer>
        </Grid>
        <Grid item md={12} sm={12} xs={12}>
          <LinksBox ids={event.links} />
        </Grid>
      </Grid>
    </MainContent>
  );
};
