import { type Actor } from "@liexp/shared/io/http";
import { type Quote } from "@liexp/shared/io/http/Events";
import { getTextContentsCapped } from "@liexp/shared/slate";
import * as React from "react";
import { Avatar } from "../../Common/Avatar";
import { Box, Grid, Typography } from "../../mui";

interface QuoteEventPageContentProps {
  event: Quote.Quote;
  actor: Actor.Actor;
}

export const QuoteEventPageContent: React.FC<QuoteEventPageContentProps> = ({
  event: item,
  actor,
}) => {
  return (
    <Grid
      container
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Grid item md={6} sm={6} xs={12} style={{ padding: 10 }}>
        <Typography style={{ display: "flex" }} variant="subtitle1">
          {getTextContentsCapped(item.excerpt as any, 300)}
        </Typography>
        <Typography variant="caption" fontStyle="italic">
          {item.payload.details}
        </Typography>
        <Box
          style={{
            textAlign: "right",
          }}
        >
          <Typography variant="subtitle2">{actor.fullName}</Typography>
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
        <Avatar src={actor.avatar} size="xlarge" />
      </Grid>
    </Grid>
  );
};
