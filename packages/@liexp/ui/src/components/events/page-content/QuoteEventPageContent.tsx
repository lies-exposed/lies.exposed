import { type Events } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Avatar } from "../../Common/Avatar.js";
import { BNEditor } from "../../Common/BlockNote/index.js";
import { Box, Grid, Typography } from "../../mui/index.js";

interface QuoteEventPageContentProps {
  event: Events.SearchEvent.SearchQuoteEvent;
}

export const QuoteEventPageContent: React.FC<QuoteEventPageContentProps> = ({
  event: item,
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
          <BNEditor content={item.excerpt} readOnly={true} />
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
        <Avatar src={item.payload.subject.id.avatar?.location} size="xlarge" />
      </Grid>
    </Grid>
  );
};
