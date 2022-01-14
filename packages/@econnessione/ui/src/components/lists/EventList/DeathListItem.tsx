import { Actor, Events, Keyword } from "@econnessione/shared/io/http";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar } from "../../Common/Avatar";
import Editor from "../../Common/Editor/index";
import KeywordList from "../KeywordList";

interface DeathListItemProps {
  item: Events.Death.Death;
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
  victim: Actor.Actor;
  links: string[];
  onClick?: (e: Events.Death.Death) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const DeathListItem: React.FC<DeathListItemProps> = ({
  item,
  victim,
  keywords,
  links,
  onClick,
  onActorClick,
  onKeywordClick,
}) => {
  // const victim = actors.find((a) => a.id === item.payload.victim);

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
        <Grid item md={12} sm={12} lg={12}>
          <Typography variant="h6">
            Death: {victim?.fullName ?? item.payload.victim}
          </Typography>
          <Grid item md={3}>
            {pipe(
              O.fromNullable(item.payload.location),
              O.fold(
                () => null,
                () => <FontAwesomeIcon icon={faMapMarker} />
              )
            )}
          </Grid>
        </Grid>
        <Grid item md={12} lg={12}>
          <KeywordList
            keywords={keywords.map((k) => ({ ...k, selected: true }))}
            onItemClick={(k) => onKeywordClick?.(k)}
          />
        </Grid>
        <Grid item lg={8} md={8} sm={12}>
          <Editor value={item.excerpt as any} readOnly />
        </Grid>
        <Grid
          item
          md={4}
          lg={4}
          style={{ display: "flex", justifyContent: "center" }}
          onClick={() => onActorClick?.(victim)}
        >
          <Avatar size="xlarge" src={victim?.avatar} />
        </Grid>
      </Grid>
    </Box>
  );
};
