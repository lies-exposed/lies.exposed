import { type Events, type Media } from "@liexp/shared/lib/io/http";
import { isValidValue } from "@liexp/shared/lib/slate";
import * as React from "react";
import { useTheme } from "../../../theme";
import { LazyEditor as Editor } from "../../Common/Editor";
import MediaElement from "../../Media/MediaElement";
import { Box, Grid } from "../../mui";

interface DocumentaryPageContentProps {
  event: Events.SearchEvent.SearchDocumentaryEvent;
  media: Media.Media;
  onMediaClick?: (m: Media.Media) => void;
  mediaLayout?: "slider" | "masonry";
}
export const DocumentaryPageContent: React.FC<DocumentaryPageContentProps> = ({
  event,
  media,
  onMediaClick,
}) => {
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
        <MediaElement
          media={media}
          disableZoom={false}
          onClick={onMediaClick}
        />
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
