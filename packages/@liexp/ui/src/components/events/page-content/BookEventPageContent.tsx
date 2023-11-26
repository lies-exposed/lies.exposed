import { type Media, type Events } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useTheme } from "../../../theme";
import MediaElement from '../../Media/MediaElement';
import { Grid, Typography } from "../../mui";

interface BookEventPageContentProps {
  event: Events.SearchEvent.SearchBookEvent;
  onMediaClick?: (m: Media.Media) => void;
}

export const BookEventPageContent: React.FC<BookEventPageContentProps> = ({
  event: item,
  onMediaClick,
}) => {
  const theme = useTheme();
  const { payload:{ media } } = item;

  return (
    <Grid
      container
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Grid
        item
        lg={12}
        md={12}
        xs={12}
        style={{
          alignContent: "flex-start",
          marginBottom: theme.spacing(5),
        }}
      >
        <MediaElement media={media.pdf} disableZoom={true} onClick={onMediaClick} />
        {media.audio ?
        <MediaElement media={media.audio} disableZoom={true} onClick={onMediaClick} />
        : null}
      </Grid>
      <Grid item md={6} sm={6} xs={12} style={{ padding: 10 }}>
        <Typography style={{ display: "flex" }} variant="subtitle1">
          {item.payload.title}
        </Typography>
      </Grid>
    </Grid>
  );
};
