import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { Box, Grid, Link } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { Avatar } from "../../Common/Avatar";
import { MarkdownRenderer } from "../../Common/MarkdownRenderer";

interface ScientificStudyListItemProps {
  item: Events.ScientificStudy.ScientificStudy;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  links: string[];
  onClick?: (e: Events.ScientificStudy.ScientificStudy) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const ScientificStudyListItem: React.FC<ScientificStudyListItemProps> =
  ({
    item,
    actors,
    groups,
    keywords,
    links,
    onClick,
    onActorClick,
    onKeywordClick,
  }) => {
    const publisher = groups.find((g) => g.id === item.publisher);
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
          <Grid item lg={3} md={3} sm={false}>
            <Avatar size="xlarge" src={publisher?.avatar} />
          </Grid>
          <Grid item lg={6} md={6}>
            <Typography variant="h5">{item.title}</Typography>
            <Link href={item.url} target="_blank">
              {item.url}
            </Link>
            <MarkdownRenderer>{item.conclusion}</MarkdownRenderer>
          </Grid>
        </Grid>
      </Box>
    );
  };
