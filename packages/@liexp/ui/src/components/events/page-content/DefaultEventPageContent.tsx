import { type Media } from "@liexp/shared/io/http";
import { type Event } from "@liexp/shared/io/http/Events";
import { isValidValue } from "@liexp/shared/slate";
import * as React from "react";
import { useTheme } from "../../../theme";
import Editor from "../../Common/Editor";
import { MediaList } from "../../lists/MediaList";
import { Box, Grid } from "../../mui";
import { MediaSlider } from "../../sliders/MediaSlider";

interface DefaultEventPageContentProps {
  event: Event;
  media: Media.Media[];
  onMediaClick: (m: Media.Media) => void;
  mediaLayout?: "slider" | "masonry";
}
export const DefaultEventPageContent: React.FC<
  DefaultEventPageContentProps
> = ({ event, media, onMediaClick, mediaLayout = "slider" }) => {
  const theme = useTheme();

  return (
    <Grid container>
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
        {media.length > 0 ? (
          mediaLayout === "masonry" ? (
            <MediaList
              media={media.map((m) => ({ ...m, selected: true }))}
              columns={2}
              onItemClick={onMediaClick}
              hideDescription={true}
            />
          ) : mediaLayout === "slider" ? (
            <MediaSlider
              data={media}
              onClick={onMediaClick}
              itemStyle={{
                maxWidth: 800,
                maxHeight: 400,
                margin: "auto",
              }}
            />
          ) : null
        ) : null}
      </Grid>
      <Grid item>
        {isValidValue(event.excerpt) ? (
          <Box style={{ marginBottom: theme.spacing(2) }}>
            <Editor value={event.excerpt} readOnly={true} />
          </Box>
        ) : null}
        {isValidValue(event.body) ? (
          <Box style={{ marginBottom: theme.spacing(2) }}>
            <Editor value={event.body} readOnly={true} />
          </Box>
        ) : null}
      </Grid>
    </Grid>
  );
};
