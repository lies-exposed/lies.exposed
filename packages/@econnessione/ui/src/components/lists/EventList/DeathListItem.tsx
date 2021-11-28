import { Actor, Events, Keyword } from "@econnessione/shared/io/http";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import formatISO from "date-fns/formatISO";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar } from "../../Common/Avatar";

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
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        marginBottom: 40,
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <Grid
          item
          md={4}
          lg={4}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Avatar size="xlarge" src={victim?.avatar} />
        </Grid>

        <Grid item md={8} lg={8}>
          <Typography variant="h6">
            {victim?.fullName ?? item.victim} died on{" "}
            {formatISO(item.date, { representation: "date" })}
          </Typography>
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
      </Grid>
    </Box>
  );
};
