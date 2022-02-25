import * as http from "@liexp/shared/io/http";
import { Box, Grid, Link, Typography } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { getTextContentsCapped, isValidValue } from "../../Common/Editor";
import { Slider } from "../../Common/Slider/Slider";
import { LinksBox } from "../../LinksBox";
import KeywordList from "../KeywordList";

interface EventListItemBaseProps {
  title: string;
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
  excerpt,
  keywords,
  media,
  links,
  onKeywordClick,
}) => {
  return (
    <Grid item lg={10} md={10} style={{ maxWidth: "100%" }}>
      <Typography variant="h6">{title}</Typography>
      {pipe(
        keywords,
        O.fromPredicate(A.isNonEmpty),
        O.fold(
          () => null,
          (kk) => (
            <KeywordList
              style={{
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
                style={{
                  maxWidth: 800,
                  maxHeight: 400,
                  margin: "auto",
                  width: "100%",
                }}
                itemStyle={{
                  maxWidth: 800,
                  maxHeight: 400,
                  minHeight: 300,
                }}
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
            <Grid item lg={8} md={12} sm={12} xs={12}>
              <LinksBox ids={ll} />
            </Grid>
          )
        )
      )}
    </Grid>
  );
};

export default EventListItemBase;
