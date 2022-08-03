import * as http from "@liexp/shared/io/http";
import { EventType } from "@liexp/shared/io/http/Events";
import { getTextContentsCapped, isValidValue } from "@liexp/shared/slate";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { styled } from "../../../theme";
import { EventIcon } from "../../Common/Icons";
import { Slider } from "../../Common/Slider/Slider";
import { LinksBox } from "../../LinksBox";
import { Box, Grid, Link, Typography } from "../../mui";
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
    [theme.breakpoints.down("md")]: {
      padding: 0,
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
    <StyledGrid
      item
      lg={10}
      md={12}
      sm={12}
      xs={12}
      style={{ maxWidth: "100%", width: "100%" }}
    >
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
      {isValidValue(excerpt) ? (
        <Typography
          style={{ display: "flex", marginBottom: 20 }}
          variant="body1"
        >
          {getTextContentsCapped(excerpt, 300)}
        </Typography>
      ) : null}
      {pipe(
        media,
        O.fromPredicate((arr) => arr.length > 0),
        O.map((media) => (
          // eslint-disable-next-line react/jsx-key
          <Grid container style={{ width: "100%" }}>
            <Grid
              item
              lg={10}
              md={12}
              sm={12}
              xs={12}
              style={{
                display: "flex",
                maxWidth: "100%",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
                flexGrow: 1,
              }}
            >
              <Box
                style={{
                  height: "100%",
                  width: "100%",
                  maxWidth: 600,
                  flexGrow: 0,
                  margin: 0,
                }}
              >
                <Slider
                  slides={media}
                  style={{ width: "100%" }}
                  itemStyle={{ minHeight: 300, maxHeight: 400, maxWidth: 600 }}
                  onLoad={onLoad}
                />
              </Box>
            </Grid>
          </Grid>
        )),
        O.toNullable
      )}
      {pipe(
        links,
        O.fromPredicate(A.isNonEmpty),
        O.fold(
          () => null,
          (ll) => (
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <LinksBox
                ids={ll}
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
