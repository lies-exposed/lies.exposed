import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { MP3Type, OGGType } from "@liexp/shared/lib/io/http/Media/index.js";
import type * as http from "@liexp/shared/lib/io/http/index.js";
import { getTextContentsCapped } from "@liexp/shared/lib/providers/blocknote/getTextContentsCapped.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import { Schema } from "effect";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import { EventIcon } from "../../Common/Icons/index.js";
import { Box, Grid, Link, Typography } from "../../mui/index.js";
import { MediaSlider } from "../../sliders/MediaSlider.js";
import KeywordList from "../KeywordList.js";
import { MediaList } from "../MediaList.js";

const PREFIX = "EventListItemBase";

const classes = {
  title: `${PREFIX}-title`,
  eventIcon: `${PREFIX}-eventIcon`,
  eventMedia: `${PREFIX}-eventMedia`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.title}`]: {
    display: "flex",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      alignItems: "center",
    },
  },

  [`& .${classes.eventIcon}`]: {
    display: "none",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      marginRight: theme.spacing(2),
    },
  },
  [`& .${classes.eventMedia}`]: {
    maxHeight: 400,
    [theme.breakpoints.down("md")]: {
      maxHeight: 300,
    },
  },
}));

interface EventListItemBaseProps<E> {
  event: E;
  title: string;
  type: EventType;
  link?: http.Link.Link;
  excerpt: any;
  keywords: readonly http.Keyword.Keyword[];
  media: readonly http.Media.Media[];
  condensed?: boolean;
  mediaDescription?: boolean;
  disableMediaAction?: boolean;
  links: readonly http.Link.Link[];
  onKeywordClick?: (k: http.Keyword.Keyword) => void;
  onRowInvalidate: (e: E) => void;
  onLoad?: () => void;
  mediaLayout?: "slider" | "masonry";
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const EventListItemBase = <E extends any>({
  event,
  title,
  link,
  type,
  excerpt,
  keywords,
  media,
  condensed = false,
  mediaDescription = true,
  disableMediaAction = true,
  links,
  onKeywordClick,
  onRowInvalidate,
  onLoad,
  mediaLayout = "slider",
}: EventListItemBaseProps<E>): React.ReactElement => {
  React.useEffect(() => {
    onLoad?.();
  }, [condensed, media.length, onLoad]);

  return (
    <StyledGrid size={12} style={{ width: "100%" }}>
      <Box className={classes.title}>
        <EventIcon className={classes.eventIcon} type={type} size="2x" />
        <Typography variant="h6" gutterBottom={true}>
          {title}
        </Typography>
      </Box>

      {pipe(
        keywords,
        O.fromPredicate(isNonEmpty),
        O.fold(
          () => null,
          (kk) => (
            <KeywordList
              style={{
                padding: 0,
                marginBottom: 20,
              }}
              keywords={kk.map((k) => ({ ...k, selected: true }))}
              onItemClick={(k) => onKeywordClick?.(k)}
            />
          ),
        ),
      )}

      {link ? (
        <Link
          href={link.url}
          target="_blank"
          style={{ display: "flex", marginBottom: 20 }}
        >
          {link.title}
        </Link>
      ) : null}

      {pipe(
        media,
        O.fromPredicate((arr) => arr.length > 0 && !condensed),
        O.map((media) => (
          <Box
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 400,
              marginBottom: 30,
            }}
          >
            {mediaLayout === "masonry" ? (
              <MediaList
                media={media.map((m) => ({ ...m, selected: true }))}
                itemStyle={{
                  maxHeight: 400,
                  height: 400,
                  maxWidth: 600,
                }}
                onItemClick={() => {}}
              />
            ) : (
              <MediaSlider
                data={media}
                itemStyle={(m) => ({
                  maxHeight: 400,
                  height:
                    Schema.is(MP3Type)(m.type) || Schema.is(OGGType)(m.type)
                      ? 100
                      : 300,
                  maxWidth: 600,
                })}
                onLoad={onLoad}
                enableDescription={mediaDescription}
                disableZoom={disableMediaAction}
              />
            )}
          </Box>
        )),
        O.toNullable,
      )}
      {excerpt ? (
        <Box>
          <Typography
            style={{ display: "flex", marginBottom: 20, flexGrow: 1 }}
            variant="body1"
          >
            {getTextContentsCapped(excerpt, 300)}
          </Typography>
        </Box>
      ) : null}
    </StyledGrid>
  );
};

export default EventListItemBase;
