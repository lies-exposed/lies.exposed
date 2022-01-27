import * as io from "@econnessione/shared/io";
import { Box, Grid, Link } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { Avatar } from "../../Common/Avatar";
import Editor from "../../Common/Editor";
import { SearchScientificStudyEvent } from "./EventListItem";

interface ScientificStudyListItemProps {
  item: SearchScientificStudyEvent;
  onClick?: (e: SearchScientificStudyEvent) => void;
  onActorClick?: (e: io.http.Actor.Actor) => void;
  onKeywordClick?: (e: io.http.Keyword.Keyword) => void;
}

export const ScientificStudyListItem: React.FC<
  ScientificStudyListItemProps
> = ({
  item,
  onClick,
  onActorClick,
  onKeywordClick,
}) => {
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
        <Grid item lg={8} md={8}>
          <Typography variant="h5">{item.payload.title}</Typography>
          <Link href={item.payload.url} target="_blank">
            {item.payload.url}
          </Link>
          <Editor readOnly value={item.body as any} />
        </Grid>
        <Grid
          item
          lg={4}
          md={4}
          sm={false}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Avatar size="xlarge" src={item.payload.publisher.avatar} />
        </Grid>
      </Grid>
    </Box>
  );
};
