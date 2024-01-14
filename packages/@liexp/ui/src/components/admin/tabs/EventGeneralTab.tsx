import * as React from "react";
import { BooleanInput, DateField, DateInput } from "react-admin";
import { Box, Grid } from "../../mui/index.js";
import ReactPageInput from "../ReactPageInput.js";
import { EventTypeInput } from "../common/inputs/EventTypeInput.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";

export const EventGeneralTab: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Grid container>
      <Grid
        item
        {...{ md: 4, lg: 4 }}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <EventTypeInput source="type" />
        <BooleanInput size="small" source="draft" />
      </Grid>
      <Grid item {...{ md: 2, lg: 2 }}>
        <DateInput source="date" />
      </Grid>
      <Grid item {...{ md: 6, lg: 6 }}>
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
      </Grid>
      <Grid item md={12}>
        {children}
      </Grid>
      <Grid item {...{ md: 12 }}>
        <ReactPageInput label="excerpt" source="excerpt" onlyText />
        <Box style={{ display: "flex", flexDirection: "column" }}>
          <DateField label="Updated At" source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </Box>
      </Grid>
    </Grid>
  );
};
