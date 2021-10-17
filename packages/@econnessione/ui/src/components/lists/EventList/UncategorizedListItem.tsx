import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { formatDate } from "@econnessione/shared/utils/date";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import LinkIcon from "@material-ui/icons/LinkOutlined";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { ActorList } from "../ActorList";
import GroupList from "../GroupList";
import KeywordList from "../KeywordList";

interface UncategorizedListItemProps {
  item: Events.Uncategorized.Uncategorized;
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
  groups: Group.Group[];
  links: string[];
  onClick?: (e: Events.Uncategorized.Uncategorized) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onGroupClick?: (e: Group.Group) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  actors,
  keywords,
  groups,
  links,
  onClick,
  onActorClick,
  onGroupClick,
  onKeywordClick,
}) => {
  return (
    <Card
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
      }}
      onClick={() => onClick?.(item)}
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
          <Grid container>
            <Grid container alignItems="center">
              <Grid item md={6} sm={6}>
                <Typography variant="caption">
                  {formatDate(item.startDate)}
                </Typography>
              </Grid>
              <Grid item md={5} sm={6} style={{ textAlign: "right" }}>
                {pipe(
                  O.fromNullable(item.location),
                  O.fold(
                    () => null,
                    () => <FontAwesomeIcon icon={faMapMarker} />
                  )
                )}
                <LinkIcon fontSize="small" />{" "}
                <Typography variant="caption">({links.length})</Typography>
              </Grid>
            </Grid>
          </Grid>
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
          <Grid item md={8} sm={8}>
            <Grid item>{item.body.substr(0, 100).concat("...")}</Grid>
          </Grid>
          <Grid container style={{ width: "100%" }} alignItems="flex-start">
            <Grid item md={4} sm={4}>
              <KeywordList
                keywords={keywords.map((t) => ({
                  ...t,
                  selected: true,
                }))}
                onItemClick={(t) => onKeywordClick?.(t)}
              />
            </Grid>
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
            <Grid item md={4} sm={4} justifyContent="flex-end">
              {/* <Typography variant="body2">Actors</Typography> */}
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
