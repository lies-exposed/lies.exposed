import { isValidValue } from "@liexp/react-page/lib/utils.js";
import { type Events, type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useTheme } from "../../../theme/index.js";
import { editor } from "../../Common/Editor/index.js";
import { Box, Grid } from "../../mui/index.js";
import { MediaSlider } from "../../sliders/MediaSlider.js";

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
        <MediaSlider
          data={event.media}
          disableZoom={false}
          onClick={onMediaClick}
          enableDescription={event.media.length > 1}
        />
      </Grid>
      <Grid item>
        {isValidValue(event.excerpt) ? (
          <Box style={{ marginBottom: theme.spacing(2) }}>
            <editor.LazyEditor value={event.excerpt} readOnly={true} />
          </Box>
        ) : null}
        {isValidValue(event.body) ? (
          <Box style={{ marginBottom: theme.spacing(2) }}>
            <editor.LazyEditor value={event.body} readOnly={true} />
          </Box>
        ) : null}
      </Grid>
    </Grid>
  );
};
