import * as io from "@econnessione/shared/io";
import { Box, Grid, Link } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import Editor from "../../Common/Editor";
import { LinksBox } from "../../LinksBox";
import { SearchScientificStudyEvent } from "./EventListItem";

interface ScientificStudyListItemProps {
  item: SearchScientificStudyEvent;
  onClick?: (e: SearchScientificStudyEvent) => void;
  onActorClick?: (e: io.http.Actor.Actor) => void;
  onKeywordClick?: (e: io.http.Keyword.Keyword) => void;
}

export const ScientificStudyListItem: React.FC<
  ScientificStudyListItemProps
> = ({ item, onClick, onActorClick, onKeywordClick }) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        marginBottom: 40,
        maxHeight: 400,
        overflow: 'hidden'
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <Grid item lg={10} md={8}>
          <Typography variant="h6">{item.payload.title}</Typography>
          <Link
            href={item.payload.url}
            target="_blank"
            style={{ marginBottom: 20 }}
          >
            {item.payload.url}
          </Link>
        </Grid>
        <Grid item lg={10} md={10} sm={12}>
          {item.excerpt ? (
            <Editor readOnly value={item.excerpt as any} />
          ) : null}
        </Grid>
        <Grid item sm={12}>
          <LinksBox ids={item.links} />
        </Grid>
      </Grid>
    </Box>
  );
};
