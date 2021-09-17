import { ActorList } from "@components/lists/ActorList";
import GroupList from "@components/lists/GroupList";
import TopicList from "@components/lists/TopicList";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Actor, Events, Group, Topic } from "@io/http";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  IconButton,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { navigate } from "@reach/router";
import { formatDate } from "@utils/date";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

interface UncategorizedListItemProps {
  item: Events.Uncategorized.Uncategorized;
  actors: Actor.Actor[];
  topics: Topic.TopicFrontmatter[];
  groups: Group.Group[];
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  actors,
  topics,
  groups,
}) => {
  return (
    <Card
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
      }}
      onClick={async () => {
        await navigate(`/events/${item.id}`);
      }}
    >
      <CardHeader
        disableTypography={true}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={<Typography variant="h6">{item.title}</Typography>}
        subheader={
          <div>
            <Typography variant="body2">
              {formatDate(item.startDate)}
            </Typography>
            {pipe(
              O.fromNullable(item.location),
              O.fold(
                () => null,
                () => <FontAwesomeIcon icon={faMapMarker} />
              )
            )}
          </div>
        }
      />
      <CardActionArea>
        {pipe(
          item.images,
          O.fromPredicate((arr) => arr.length > 0),
          O.map((images) => (
            // eslint-disable-next-line react/jsx-key
            <CardMedia
              component="img"
              alt="Contemplative Reptile"
              height="300"
              image={images[0].location}
              title="Contemplative Reptile"
            />
          )),
          O.toNullable
        )}
        <CardContent>
          <Grid container>
            <Grid item></Grid>
          </Grid>
          <Grid container style={{ width: "100%" }}>
            <Grid item md={4}>
              <Typography variant="body2">Topics</Typography>
              <TopicList
                topics={topics.map((t) => ({
                  ...t,
                  selected: true,
                }))}
                onTopicClick={async (t) => {
                  // await navigate(`/topics/${t.id}`)
                  return undefined;
                }}
              />
            </Grid>
            <Grid item md={4}>
              <Typography variant="body2">Gruppi</Typography>
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
                      onGroupClick={async (group) => {
                        await navigate(`/groups/${group.id}`);
                      }}
                    />
                  )
                )
              )}
            </Grid>
            <Grid item md={4}>
              <Typography variant="body2">Actors</Typography>
              {pipe(
                actors,
                O.fromPredicate(A.isNonEmpty),
                O.fold(
                  () => null,
                  (actors) => (
                    <ActorList
                      actors={actors.map((a) => ({
                        ...a,
                        selected: false,
                      }))}
                      onActorClick={async (actor) => {
                        await navigate(`/actors/${actor.id}`);
                      }}
                    />
                  )
                )
              )}
            </Grid>
          </Grid>

          {/* {pipe(
            item.images,
            O.fromPredicate((arr) => arr.length > 0),
            O.map((images) => (
              // eslint-disable-next-line react/jsx-key
              <Grid style={{ height: 600 }}>
                <Slider
                  key="home-slider"
                  slides={images.map((i) => ({
                    authorName: "",
                    info: i.description,
                    imageURL: i.location,
                  }))}
                  arrows={true}
                  adaptiveHeight={true}
                  dots={true}
                />
              </Grid>
            )),
            O.toNullable
          )} */}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
