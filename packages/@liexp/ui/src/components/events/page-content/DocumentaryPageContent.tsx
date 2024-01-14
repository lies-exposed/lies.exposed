import { type Events, type Media } from "@liexp/shared/lib/io/http/index.js";
import { isValidValue } from "@liexp/shared/lib/slate/index.js";
import * as React from "react";
import { useTheme } from "../../../theme/index.js";
import { LazyEditor as Editor } from "../../Common/Editor/index.js";
import MediaElement from "../../Media/MediaElement.js";
import { Box, Grid } from "../../mui/index.js";

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
