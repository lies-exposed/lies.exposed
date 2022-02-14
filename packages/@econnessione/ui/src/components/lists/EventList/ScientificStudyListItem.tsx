import * as io from "@econnessione/shared/io";
import { Box, Grid, Link } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import Editor from "../../Common/Editor";
import { Slider } from "../../Common/Slider/Slider";
import { LinksBox } from "../../LinksBox";
import KeywordList from '../KeywordList';
import { SearchScientificStudyEvent } from "./EventListItem";

interface ScientificStudyListItemProps {
  item: SearchScientificStudyEvent;
  onClick?: (e: SearchScientificStudyEvent) => void;
  onActorClick?: (e: io.http.Actor.Actor) => void;
  onKeywordClick?: (e: io.http.Keyword.Keyword) => void;
}

export const ScientificStudyListItem: React.FC<
  ScientificStudyListItemProps
> = ({ item, onClick, onActorClick, onKeywordClick }) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        marginBottom: 40,
        maxHeight: 400,
        overflow: "hidden",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <Grid item lg={10} md={8}>
          <Typography variant="h6">{item.payload.title}</Typography>
          <KeywordList
            keywords={item.keywords.map((k) => ({ ...k, selected: true }))}
            onItemClick={(k) => onKeywordClick?.(k)}
          />
          <Link
            href={item.payload.url}
            target="_blank"
            style={{ display: 'block', marginBottom: 20 }}
          >
            {item.payload.url}
          </Link>
        </Grid>

        {item.excerpt ? (
          <Grid item lg={10} md={10} sm={12}>
            <Editor readOnly value={item.excerpt as any} />
          </Grid>
        ) : null}

        <Grid
          item
          lg={12}
          md={12}
          sm={12}
          xs={12}
          style={{
            justifyContent: "center",
            alignItems: "center",
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
            {pipe(
              item.media,
              O.fromPredicate((arr) => arr.length > 0),
              O.map((media) => (
                // eslint-disable-next-line react/jsx-key
                <Slider
                  slides={media}
                  style={{
                    maxWidth: 600,
                    maxHeight: 500,
                    margin: "auto",
                    width: "100%",
                  }}
                  itemStyle={{
                    maxWidth: 800,
                    maxHeight: 500,
                    minHeight: 400,
                  }}
                />
              )),
              O.toNullable
            )}
          </Box>
        </Grid>
        <Grid item sm={12}>
          <LinksBox ids={item.links} />
        </Grid>
      </Grid>
    </Box>
  );
};
