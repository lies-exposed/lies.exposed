import { type Events, type Media } from "@liexp/shared/lib/io/http/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import * as React from "react";
import { useTheme } from "../../../theme/index.js";
import { BNEditor } from "../../Common/BlockNote/Editor.js";
import MediaElement from "../../Media/MediaElement.js";
import { Grid, Typography } from "../../mui/index.js";

interface BookEventPageContentProps {
  event: Events.SearchEvent.SearchBookEvent;
  onMediaClick?: (m: Media.Media) => void;
}

export const BookEventPageContent: React.FC<BookEventPageContentProps> = ({
  event: item,
  onMediaClick,
}) => {
  const theme = useTheme();
  const {
    payload: { media },
  } = item;

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
        size={12}
        style={{
          alignContent: "flex-start",
          marginBottom: theme.spacing(5),
        }}
      >
        <MediaElement
          media={media.pdf}
          disableZoom={false}
          onClick={onMediaClick}
          itemStyle={{
            width: "100%",
            height: 500,
            marginBottom: theme.spacing(5),
          }}
        />
        {media.audio ? (
          <MediaElement
            media={media.audio}
            disableZoom={true}
            onClick={onMediaClick}
          />
        ) : null}
      </Grid>
      <Grid
        size={{ md: 12, sm: 12, xs: 12 }}
        style={{ padding: 10 }}
        width="100%"
      >
        <Typography style={{ display: "flex" }} variant="h5">
          {item.payload.title}
        </Typography>
        {isValidValue(item.excerpt) ? (
          <BNEditor content={item.excerpt} readOnly />
        ) : null}
      </Grid>
    </Grid>
  );
};
