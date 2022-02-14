import {
  Actor,
  Group,
  GroupMember,
  Keyword
} from "@econnessione/shared/io/http";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { isValueEmpty } from "../../Common/Editor";
import EllipsesContent from "../../Common/EllipsedContent";
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
  ...props
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
        <Grid item md={10} sm={12} xs={12}>
          <Typography
            variant="h6"
            onClick={() => onClick?.(item)}
            style={{
              marginBottom: 10,
            }}
          >
            {item.payload.title}
          </Typography>
          <Grid item md={12} style={{ marginBottom: 10 }}>
            <KeywordList
              keywords={item.keywords.map((t) => ({
                ...t,
                selected: true,
              }))}
              onItemClick={(t) => onKeywordClick?.(t)}
            />
          </Grid>

          {isValueEmpty(item.excerpt as any) ? (
            <Grid item md={10} sm={10}>
              <EllipsesContent
                height={100}
                content={(item.excerpt as any) ?? null}
              />
            </Grid>
          ) : null}
        </Grid>
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
        <Grid item md={12} sm={12} style={{ textAlign: "right" }}>
          {pipe(
            O.fromNullable(item.payload.location),
            O.fold(
              () => null,
              () => <FontAwesomeIcon icon="map-marker" />
            )
          )}
        </Grid>
        <Grid item lg={8} md={12} sm={12} xs={12}>
          <LinksBox ids={item.links} />
        </Grid>
      </Grid>
    </Box>
  );
};
