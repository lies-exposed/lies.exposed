import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
} from "@econnessione/shared/io/http";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, CardMedia, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import LinkIcon from "@material-ui/icons/LinkOutlined";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { MarkdownRenderer } from "../../Common/MarkdownRenderer";
import { ActorList } from "../ActorList";
import GroupList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";
import KeywordList from "../KeywordList";

interface UncategorizedListItemProps {
  item: Events.Uncategorized.Uncategorized;
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  links: string[];
  onClick?: (e: Events.Uncategorized.Uncategorized) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onGroupClick?: (e: Group.Group) => void;
  onGroupMemberClick?: (g: GroupMember.GroupMember) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  actors,
  keywords,
  groups,
  groupsMembers,
  links,
  onClick,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
}) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
        width: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <Grid item md={3} sm={12} xs={12}>
          {pipe(
            item.images,
            O.fromPredicate((arr) => arr.length > 0),
            O.map((images) => (
              // eslint-disable-next-line react/jsx-key
              <CardMedia
                component="img"
                alt={images[0].description}
                height="300"
                image={images[0].location}
                title={images[0].description}
              />
            )),
            O.toNullable
          )}
        </Grid>
        <Grid item md={9}>
          <Typography variant="h6">{item.title}</Typography>
          <Grid item md={12} style={{ marginBottom: 20 }}>
            <KeywordList
              keywords={keywords.map((t) => ({
                ...t,
                selected: true,
              }))}
              onItemClick={(t) => onKeywordClick?.(t)}
            />
          </Grid>
          <Grid container>
            <Grid container alignItems="center">
              <Grid item md={12} sm={12} style={{ textAlign: "right" }}>
                {pipe(
                  O.fromNullable(item.location),
                  O.fold(
                    () => null,
                    () => <FontAwesomeIcon icon={faMapMarker} />
                  )
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="body1" style={{ marginBottom: 20 }}>
              <MarkdownRenderer>{item.body}</MarkdownRenderer>
            </Typography>
            <Grid container alignItems="center">
              <LinkIcon fontSize="small" />{" "}
              <Typography variant="caption">({links.length})</Typography>
            </Grid>
          </Grid>
          <Grid container style={{ width: "100%" }} alignItems="flex-start">
            <Grid item md={4} sm={4}>
              {pipe(
                groups,
                O.fromPredicate(A.isNonEmpty),
                O.fold(
                  () => null,
                  (groups) => (
                    <GroupList
                      groups={groups.map((g) => ({
                        ...g,
                        selected: false,
                      }))}
                      onGroupClick={(group) => onGroupClick?.(group)}
                    />
                  )
                )
              )}
            </Grid>

            <Grid item md={4} sm={4}>
              {pipe(
                groupsMembers,
                O.fromPredicate(A.isNonEmpty),
                O.fold(
                  () => null,
                  (gms) => (
                    <GroupsMembersList
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                      groupsMembers={gms.map((a) => ({
                        ...a,
                        selected: false,
                      }))}
                      onItemClick={(gm) => onGroupMemberClick?.(gm)}
                    />
                  )
                )
              )}
            </Grid>
            <Grid item md={4} sm={4}>
              {pipe(
                actors,
                O.fromPredicate(A.isNonEmpty),
                O.fold(
                  () => null,
                  (actors) => (
                    <ActorList
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                      actors={actors.map((a) => ({
                        ...a,
                        selected: false,
                      }))}
                      onActorClick={(actor) => onActorClick?.(actor)}
                    />
                  )
                )
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
