import { Actor, Keyword } from "@econnessione/shared/io/http";
import { Box, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import Editor from "../../Common/Editor/index";
import { LinksBox } from "../../LinksBox";
import KeywordList from "../KeywordList";
import { SearchDeathEvent } from "./EventListItem";

interface DeathListItemProps {
  item: SearchDeathEvent;
  onClick?: (e: SearchDeathEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const DeathListItem: React.FC<DeathListItemProps> = ({
  item,
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
            Death: {item.payload.victim?.fullName ?? item.payload.victim}
          </Typography>
        </Grid>
        <Grid item md={12} lg={12}>
          <KeywordList
            keywords={item.keywords.map((k) => ({ ...k, selected: true }))}
            onItemClick={(k) => onKeywordClick?.(k)}
          />
        </Grid>
        <Grid item lg={8} md={8} sm={12}>
          <Editor value={item.excerpt as any} readOnly />
        </Grid>
        <Grid item lg={8} md={12} sm={12} xs={12}>
          <LinksBox ids={item.links} />
        </Grid>
      </Grid>
    </Box>
  );
};
