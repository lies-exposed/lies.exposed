import { Actor, Events, Keyword } from "@econnessione/shared/io/http";
import { formatDate } from "@econnessione/shared/utils/date";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar } from "../../Common/Avatar";
import KeywordList from "../KeywordList";

interface DeathListItemProps {
  item: Events.Death.Death;
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
  links: string[];
  onClick?: (e: Events.Death.Death) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const DeathListItem: React.FC<DeathListItemProps> = ({
  item,
  actors,
  keywords,
  links,
  onClick,
  onActorClick,
  onKeywordClick,
}) => {
  const victim = actors.find((a) => a.id === item.victim);

  return (
    <Card
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
        background: "#00000040",
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
        title={
          <Typography variant="h6">
            {victim?.fullName ?? item.victim} died on {item.date.toISOString()}
          </Typography>
        }
        subheader={
          <Grid container>
            <Grid item md={3}>
              <Typography variant="body2">{formatDate(item.date)}</Typography>
            </Grid>
            <Grid item md={3}>
              {pipe(
                O.fromNullable(item.location),
                O.fold(
                  () => null,
                  () => <FontAwesomeIcon icon={faMapMarker} />
                )
              )}
            </Grid>
          </Grid>
        }
      />
      <CardActionArea>
        <CardContent>
          <Grid item md={6}>
            <Grid item>
              <Avatar src={victim?.avatar} />
            </Grid>
          </Grid>
          <Grid container style={{ width: "100%" }} alignItems="flex-start">
            <Grid item md={4}>
              <Typography variant="body2">Keywords</Typography>
              <KeywordList
                keywords={keywords.map((t) => ({
                  ...t,
                  selected: true,
                }))}
                onItemClick={(t) => onKeywordClick?.(t)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
