import { Actor, Events, Keyword } from "@liexp/shared/io/http";
import { ByActor, ByGroup } from "@liexp/shared/io/http/Common";
import { Box, Grid, Typography } from "@material-ui/core";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import * as React from "react";
import { getTextContentsCapped, isValidValue } from "../../Common/Editor";
import { ActorListItem } from "../ActorList";
import { GroupListItem } from "../GroupList";

const getSubject = (
  subject: Events.SearchEvent.SearchTransactionEvent["payload"]["from"]
): JSX.Element => {
  if (subject.type === ByActor.type.props.type.value) {
    return (
      <ActorListItem
        style={{ display: "inline" }}
        item={{ ...subject.id, selected: false }}
      />
    );
  }
  if (subject.type === ByGroup.type.props.type.value) {
    return (
      <GroupListItem
        style={{ display: "inline" }}
        item={{ ...subject.id, selected: false }}
      />
    );
  }
  return <div />;
};

interface TransactionListItemProps {
  item: Events.SearchEvent.SearchTransactionEvent;
  onClick?: (e: Events.SearchEvent.SearchTransactionEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onKeywordClick,
}) => {
  return (
    <Box
      id={item.id}
      style={{
        width: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">{item.payload.title}</Typography>
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            // justifyContent: 'center'
          }}
        >
          <Box display={"flex"}>{getSubject(item.payload.from)}</Box>
          <Box display={"flex"}>
            <ArrowRightIcon />
            <Typography variant="subtitle1">
              {item.payload.total} {item.payload.currency}
            </Typography>
            <ArrowRightIcon />
          </Box>
          <Box display="flex">{getSubject(item.payload.to)}</Box>
        </Grid>

        {isValidValue(item.excerpt as any) ? (
          <Grid item xs={12}>
            <Typography style={{ display: "flex" }} variant="body1">
              {getTextContentsCapped(item.excerpt as any, 300)}
            </Typography>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
};
