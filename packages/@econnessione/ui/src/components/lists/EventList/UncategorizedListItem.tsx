import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
  Link,
  Media,
} from "@econnessione/shared/io/http";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import LinkIcon from "@material-ui/icons/LinkOutlined";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Slider } from "../../Common/Slider/Slider";
import { ActorList } from "../ActorList";
import GroupList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";
import KeywordList from "../KeywordList";
import Editor from "@components/Common/Editor";

interface UncategorizedListItemProps {
  item: Events.Uncategorized.Uncategorized;
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  media: Media.Media[];
  links: Link.Link[];
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
  media,
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
    >
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid item md={8} sm={12} xs={12}>
          <Typography variant="h6" onClick={() => onClick?.(item)}>
            {item.payload.title}
          </Typography>
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
            <Grid item md={9} sm={9}>
              <Editor readOnly value={(item.excerpt as any) ?? null} />
            </Grid>
            <Grid item md={3} sm={3} style={{ textAlign: "right" }}>
              {pipe(
                O.fromNullable(item.payload.location),
                O.fold(
                  () => null,
                  () => <FontAwesomeIcon icon={faMapMarker} />
                )
              )}
              <Box
                display={"flex"}
                alignContent={"center"}
                flexDirection={"row-reverse"}
                textAlign={"right"}
              >
                <LinkIcon fontSize="small" />{" "}
                <Typography variant="caption">({links.length})</Typography>
              </Box>
              {pipe(
                groups,
                O.fromPredicate(A.isNonEmpty),
                O.fold(
                  () => null,
                  (groups) => (
                    <Box>
                      <Typography
                        variant="caption"
                        color="primary"
                        gutterBottom={false}
                      >
                        Groups
                      </Typography>
                      <GroupList
                        style={{
                          display: "flex",
                          flexDirection: "row-reverse",
                          alignItems: "flex-end",
                        }}
                        groups={groups.map((g) => ({
                          ...g,
                          selected: false,
                        }))}
                        onGroupClick={(group) => onGroupClick?.(group)}
                      />
                    </Box>
                  )
                )
              )}

              {pipe(
                groupsMembers,
                O.fromPredicate(A.isNonEmpty),
                O.fold(
                  () => null,
                  (gms) => (
                    <Box>
                      <Typography
                        variant="caption"
                        color="primary"
                        gutterBottom={false}
                      >
                        Groups Members
                      </Typography>
                      <GroupsMembersList
                        style={{
                          display: "flex",
                          flexDirection: "row-reverse",
                          alignItems: "flex-end",
                        }}
                        groupsMembers={gms.map((a) => ({
                          ...a,
                          selected: false,
                        }))}
                        onItemClick={(gm) => onGroupMemberClick?.(gm)}
                      />
                    </Box>
                  )
                )
              )}

              {pipe(
                actors,
                O.fromPredicate(A.isNonEmpty),
                O.fold(
                  () => null,
                  (actors) => (
                    <Box>
                      <Typography
                        variant="caption"
                        color="primary"
                        gutterBottom={false}
                      >
                        Actors
                      </Typography>
                      <ActorList
                        style={{
                          display: "flex",
                          flexDirection: "row-reverse",
                          alignItems: "flex-end",
                        }}
                        actors={actors.map((a) => ({
                          ...a,
                          selected: false,
                        }))}
                        onActorClick={(actor) => onActorClick?.(actor)}
                      />
                    </Box>
                  )
                )
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          md={4}
          sm={12}
          xs={12}
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: "100%",
              maxWidth: 300,
              position: "relative",
            }}
          >
            {pipe(
              media,
              O.fromPredicate((arr) => arr.length > 0),
              O.map((media) => (
                // eslint-disable-next-line react/jsx-key
                <Slider
                  adaptiveHeight={false}
                  infinite={false}
                  arrows={false}
                  draggable={false}
                  dots={true}
                  swipe={false}
                  variableWidth={false}
                  slidesToShow={1}
                  slidesToScroll={1}
                  slides={media}
                  style={{
                    maxWidth: 300,
                  }}
                />
              )),
              O.toNullable
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
