import type * as http from "@liexp/shared/io/http";
import { type EventType } from "@liexp/shared/io/http/Events";
import { getTextContentsCapped, isValidValue } from "@liexp/shared/slate";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { styled } from "../../../theme";
import { EventIcon } from "../../Common/Icons";
import { LinksBox } from "../../LinksBox";
import { Box, Grid, Link, Typography } from "../../mui";
import { MediaSlider } from "../../sliders/MediaSlider";
import KeywordList from "../KeywordList";

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
  url?: string;
  excerpt: any;
  keywords: http.Keyword.Keyword[];
  media: http.Media.Media[];
  links: string[];
  onKeywordClick?: (k: http.Keyword.Keyword) => void;
  onRowInvalidate: (e: E) => void;
  onLoad?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const EventListItemBase = <E extends any>({
  event,
  title,
  url,
  type,
  excerpt,
  keywords,
  media,
  links,
  onKeywordClick,
  onRowInvalidate,
  onLoad,
}: EventListItemBaseProps<E>): JSX.Element => {
  React.useEffect(() => {
    if (media.length === 0) {
      onLoad?.();
    }
  }, []);

  return (
    <StyledGrid item lg={12} md={12} sm={12} xs={12} style={{ width: "100%" }}>
      <Box className={classes.title}>
        <EventIcon className={classes.eventIcon} type={type} size="2x" />
        <Typography variant="h6" gutterBottom={true}>
          {title}
        </Typography>
      </Box>

      {pipe(
        keywords,
        O.fromPredicate(A.isNonEmpty),
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
          )
        )
      )}

      {url ? (
        <Link
          href={url}
          target="_blank"
          style={{ display: "flex", marginBottom: 20 }}
        >
          {url}
        </Link>
      ) : null}

      {pipe(
        media,
        O.fromPredicate((arr) => arr.length > 0),
        O.map((media) => (
          // eslint-disable-next-line react/jsx-key
          <Box
            style={{
              width: "100%",
              height: 400,
              marginBottom: 30,
            }}
          >
            <MediaSlider
              data={media}
              itemStyle={{ height: 400, maxWidth: 600 }}
              onLoad={onLoad}
              enableDescription={true}
            />
          </Box>
        )),
        O.toNullable
      )}
      {isValidValue(excerpt) ? (
        <Box>
          <Typography
            style={{ display: "flex", marginBottom: 20, flexGrow: 1 }}
            variant="body1"
          >
            {getTextContentsCapped(excerpt, 300)}
          </Typography>
        </Box>
      ) : null}
      {pipe(
        links,
        O.fromPredicate(A.isNonEmpty),
        O.fold(
          () => null,
          (ll) => (
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <LinksBox
                filter={{ ids: ll }}
                onOpen={() => {
                  onRowInvalidate(event);
                }}
                onClose={() => {
                  onRowInvalidate(event);
                }}
                onClick={() => {}}
              />
            </Grid>
          )
        )
      )}
    </StyledGrid>
  );
};

export default EventListItemBase;
