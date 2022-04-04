import * as http from "@liexp/shared/io/http";
import { EventType } from "@liexp/shared/io/http/Events";
import { Box, Grid, Link, makeStyles, Typography } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { getTextContentsCapped, isValidValue } from "../../Common/Editor";
import { EventIcon } from "../../Common/Icons";
import { Slider } from "../../Common/Slider/Slider";
import { LinksBox } from "../../LinksBox";
import KeywordList from "../KeywordList";

const useStyles = makeStyles((theme) => ({
  title: {
    display: "flex",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
    },
  },
  eventIcon: {
    display: 'none',

    [theme.breakpoints.down('md')]: {
      display: 'flex',
      marginRight: theme.spacing(2)
    }
  }
}));

interface EventListItemBaseProps {
  title: string;
  type: EventType;
  url?: string;
  excerpt: any;
  keywords: http.Keyword.Keyword[];
  media: http.Media.Media[];
  links: string[];
  onKeywordClick?: (k: http.Keyword.Keyword) => void;
}

const EventListItemBase: React.FC<EventListItemBaseProps> = ({
  title,
  url,
  type,
  excerpt,
  keywords,
  media,
  links,
  onKeywordClick,
}) => {
  const classes = useStyles();

  return (
    <Grid
      item
      lg={10}
      md={12}
      sm={12}
      xs={12}
      style={{ maxWidth: "100%", width: "100%" }}
    >
      <Box className={classes.title}>
        <EventIcon
          className={classes.eventIcon}
          type={type}
          size="2x"
        />
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
        <Typography style={{ display: "flex" }} variant="body1">
          {getTextContentsCapped(excerpt, 300)}
        </Typography>
      ) : null}
      {pipe(
        media,
        O.fromPredicate((arr) => arr.length > 0),
        O.map((media) => (
          // eslint-disable-next-line react/jsx-key
          <Grid
            item
            lg={12}
            md={12}
            sm={12}
            xs={12}
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Box
              style={{
                height: "100%",
                width: "100%",
                position: "relative",
                margin: 0,
              }}
            >
              <Slider
                slides={media}
                itemStyle={{ minHeight: 400, maxHeight: 400 }}
              />
            </Box>
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
              <LinksBox ids={ll} />
            </Grid>
          )
        )
      )}
    </Grid>
  );
};

export default EventListItemBase;
