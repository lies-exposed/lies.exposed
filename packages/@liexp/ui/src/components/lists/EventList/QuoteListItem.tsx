import { type Actor, type Events, type Keyword } from "@liexp/shared/lib/io/http";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/Quote";
import { getTextContents } from "@liexp/shared/lib/slate";
import * as React from "react";
import { styled } from "../../../theme";
import { Avatar } from "../../Common/Avatar";
import { EventIcon } from "../../Common/Icons";
import { Box, Grid, Typography } from "../../mui";

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
  onClick?: (e: Events.SearchEvent.SearchQuoteEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchQuoteEvent) => void;
  onLoad?: () => void;
}

export const QuoteListItem: React.FC<QuoteListItemProps> = ({
  item,
  onClick,
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
            type={QUOTE.value}
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
          <Grid item md={6} sm={6} xs={12} style={{ padding: 10 }}>
            <Typography style={{ display: "flex" }} variant="subtitle1">
              {getTextContents(item.excerpt as any)}
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
                {item.payload.actor.fullName}
              </Typography>
            </Box>
          </Grid>
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
            <Avatar src={item.payload.actor.avatar} size="xlarge" />
          </Grid>
        </Grid>
      </Grid>
    </StyledBox>
  );
};
