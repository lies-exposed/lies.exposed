import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  type Actor,
  type Events,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import { Avatar } from "../../Common/Avatar.js";
import { EventIcon } from "../../Common/Icons/index.js";
import { Box, Grid, Typography } from "../../mui/index.js";

const PREFIX = "QuoteListItem";

const classes = {
  eventIcon: `${PREFIX}-eventIcon`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.eventIcon}`]: {
    display: "none",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      marginRight: theme.spacing(2),
    },
  },
}));

interface QuoteListItemProps {
  item: Events.SearchEvent.SearchQuoteEvent;
  condensed?: boolean;
  onClick?: (e: Events.SearchEvent.SearchQuoteEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchQuoteEvent) => void;
  onLoad?: () => void;
}

export const QuoteListItem: React.FC<QuoteListItemProps> = ({
  item,
  onClick,
  condensed,
  onActorClick,
  onKeywordClick,
  onLoad,
}) => {
  React.useEffect(() => {
    onLoad?.();
  });

  return (
    <StyledBox
      id={item.id}
      style={{
        width: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} style={{ display: "flex", flexDirection: "row" }}>
          <EventIcon
            className={classes.eventIcon}
            type={EventTypes.QUOTE.value}
            size="2x"
          />
        </Grid>

        <Grid
          container
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // justifyContent: 'center'
          }}
        >
          <Grid
            item
            md={!condensed ? 6 : 12}
            sm={!condensed ? 6 : 12}
            xs={12}
            style={{ padding: 10 }}
          >
            <Typography style={{ display: "flex" }} variant="subtitle1">
              {item.payload.quote}
            </Typography>
            <Typography variant="caption" fontStyle="italic">
              {item.payload.details}
            </Typography>
            <Box
              style={{
                textAlign: "right",
              }}
            >
              <Typography variant="subtitle2">
                {item.payload.subject.type === "Group"
                  ? item.payload.subject.id.name
                  : item.payload.subject.id.fullName}
              </Typography>
            </Box>
          </Grid>
          {!condensed ? (
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Avatar
                src={
                  item.payload.subject.id.avatar?.thumbnail ??
                  item.payload.subject.id.avatar?.location
                }
                size="xlarge"
              />
            </Grid>
          ) : null}
        </Grid>
      </Grid>
    </StyledBox>
  );
};
