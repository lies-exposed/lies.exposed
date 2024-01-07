import {
  type Actor,
  type Events,
  type Keyword,
} from "@liexp/shared/lib/io/http";
import { ByActorId, ByGroupId } from "@liexp/shared/lib/io/http/Common";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/EventType";
import { getTextContentsCapped, isValidValue } from "@liexp/shared/lib/slate";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import * as React from "react";
import { styled } from "../../../theme";
import { EventIcon } from "../../Common/Icons";
import { Box, Grid, Typography } from "../../mui";
import { ActorListItem } from "../ActorList";
import { GroupListItem } from "../GroupList";

const PREFIX = "TransactionListItem";

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

const getSubject = (
  subject: Events.SearchEvent.SearchTransactionEvent["payload"]["from"],
  condensed: boolean
): JSX.Element => {
  if (subject.type === ByActorId.type.props.type.value) {
    return (
      <ActorListItem
        avatarSize={ condensed ?"xsmall" : 'small'}
        style={{ display: "inline" }}
        item={{ ...subject.id, selected: true }}
      />
    );
  }
  if (subject.type === ByGroupId.type.props.type.value) {
    return (
      <GroupListItem
      avatarSize={ condensed ?"xsmall" : 'small'}
        style={{ display: "inline" }}
        item={{ ...subject.id, selected: true }}
      />
    );
  }
  return <div />;
};

interface TransactionListItemProps {
  item: Events.SearchEvent.SearchTransactionEvent;
  condensed?: boolean;
  onClick?: (e: Events.SearchEvent.SearchTransactionEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchTransactionEvent) => void;
  onLoad?: () => void;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  item,
  condensed = false,
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
            type={TRANSACTION.value}
            size="2x"
          />
          <Typography variant="h6">{item.payload.title}</Typography>
        </Grid>
        <Grid
          item
          md={condensed ? 6 : 12}
          sm={condensed ? 6 : 12}
          xs={12}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // justifyContent: 'center'
          }}
        >
          <Box display={"flex"}>{getSubject(item.payload.from, condensed)}</Box>
          <Box display={"flex"}>
            <ArrowRightIcon />
            <Typography variant="subtitle1">
              {item.payload.total} {item.payload.currency}
            </Typography>
            <ArrowRightIcon />
          </Box>
          <Box display="flex">{getSubject(item.payload.to, condensed)}</Box>
        </Grid>

        {isValidValue(item.excerpt as any) ? (
          <Grid item md={condensed ? 6 : 12} sm={condensed ? 6 : 12} xs={12}>
            <Typography style={{ display: "flex" }} variant="body1">
              {getTextContentsCapped(item.excerpt as any, 300)}
            </Typography>
          </Grid>
        ) : null}
      </Grid>
    </StyledBox>
  );
};
