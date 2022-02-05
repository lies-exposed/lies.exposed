import {
  Actor,
  Group,
  GroupMember,
  Keyword,
} from "@econnessione/shared/io/http";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import Editor from "../../Common/Editor";
import { Slider } from "../../Common/Slider/Slider";
import { LinksBox } from "../../LinksBox";
import KeywordList from "../KeywordList";
import { SearchUncategorizedEvent } from "./EventListItem";

interface UncategorizedListItemProps {
  item: SearchUncategorizedEvent;
  onClick?: (e: SearchUncategorizedEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onGroupClick?: (e: Group.Group) => void;
  onGroupMemberClick?: (g: GroupMember.GroupMember) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
}) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
        width: "100%",
      }}
    >
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid item md={8} sm={12} xs={12}>
          <Typography variant="h6" onClick={() => onClick?.(item)}>
            {item.payload.title}
          </Typography>
          <Grid item md={12} style={{ marginBottom: 20 }}>
            <KeywordList
              keywords={item.keywords.map((t) => ({
                ...t,
                selected: true,
              }))}
              onItemClick={(t) => onKeywordClick?.(t)}
            />
          </Grid>

          <Grid container>
            <Grid item md={9} sm={9}>
              <Editor readOnly value={(item.excerpt as any) ?? null} />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          md={4}
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
                  adaptiveHeight={false}
                  infinite={false}
                  arrows={false}
                  draggable={false}
                  dots={true}
                  swipe={false}
                  variableWidth={false}
                  slidesToShow={1}
                  slidesToScroll={1}
                  slides={media}
                  style={{
                    margin: 0,
                    width: "100%",
                    height: '100%'
                  }}
                />
              )),
              O.toNullable
            )}
          </Box>
        </Grid>
        <Grid item md={12} sm={12} style={{ textAlign: "right" }}>
          {pipe(
            O.fromNullable(item.payload.location),
            O.fold(
              () => null,
              () => <FontAwesomeIcon icon={faMapMarker} />
            )
          )}
        </Grid>
        <Grid item>
          <LinksBox ids={item.links} />
        </Grid>
      </Grid>
    </Box>
  );
};
