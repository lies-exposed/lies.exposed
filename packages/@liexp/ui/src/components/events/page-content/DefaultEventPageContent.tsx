import {
  IframeVideoType,
  MP3Type,
  MP4Type,
  OGGType,
} from "@liexp/shared/lib/io/http/Media.js";
import { type Events, type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useModal } from "../../../hooks/useModal.js";
import { useTheme } from "../../../theme/index.js";
import { BNEditor } from "../../Common/BlockNote/index.js";
import { MediaModalContent } from "../../Modal/MediaSliderModal.js";
import { MediaList } from "../../lists/MediaList.js";
import { Box, Grid } from "../../mui/index.js";
import { MediaSlider } from "../../sliders/MediaSlider.js";

interface DefaultEventPageContentProps {
  event: Events.SearchEvent.SearchEvent;
  media: Media.Media[];
  onMediaClick?: (m: Media.Media) => void;
  mediaLayout?: "slider" | "masonry";
}
export const DefaultEventPageContent: React.FC<
  DefaultEventPageContentProps
> = ({ event, media, onMediaClick, mediaLayout = "slider" }) => {
  const theme = useTheme();
  const [modal, showModal] = useModal();

  const isOnlyOneMedia =
    media.length === 1 &&
    (IframeVideoType.is(media[0].type) ||
      MP4Type.is(media[0].type) ||
      MP3Type.is(media[0].type) ||
      OGGType.is(media[0].type));

  const handleMediaClick = React.useCallback(
    (m: Media.Media) => {
      showModal("media", () => (
        <MediaModalContent
          data={media}
          initialSlide={media.findIndex((_) => _.id === m.id)}
        />
      ));
    },
    [modal, onMediaClick],
  );

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
              columns={media.length > 3 ? 3 : media.length}
              onItemClick={!isOnlyOneMedia ? handleMediaClick : undefined}
              itemStyle={{
                maxWidth: 800,
                maxHeight: 600,
              }}
              hideDescription={true}
              disableZoom={!isOnlyOneMedia}
            />
          ) : mediaLayout === "slider" ? (
            <MediaSlider
              data={media}
              onClick={!isOnlyOneMedia ? handleMediaClick : undefined}
              itemStyle={(m) => ({
                maxWidth: 800,
                minHeight: MP3Type.is(m.type) || OGGType.is(m.type) ? 100 : 400,
                margin: "auto",
              })}
              disableZoom={!isOnlyOneMedia}
            />
          ) : null
        ) : null}
        {modal}
      </Grid>
      <Grid item>
        {event.excerpt ? (
          <Box style={{ marginBottom: theme.spacing(2) }}>
            <BNEditor content={event.excerpt as any} readOnly />
          </Box>
        ) : null}
        {event.body ? (
          <Box style={{ marginBottom: theme.spacing(2) }}>
            <BNEditor content={event.body as any} readOnly />
          </Box>
        ) : null}
      </Grid>
    </Grid>
  );
};
