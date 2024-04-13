import React from "react";
import { EventIcon } from "../../Common/Icons/index.js";
import { Box } from "../../mui/index.js";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
} from "../react-admin.js";
import { EventTitle } from "./titles/EventTitle.js";

const ReferenceEventInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput
      sort={{ field: "updatedAt", order: "DESC" }}
      filter={{ withDrafts: true }}
      {...props}
      reference="events"
    >
      <AutocompleteInput
        source="id"
        size="small"
        filterToQuery={(q) => ({ q })}
        fullWidth
        getOptionLabel={(r) => r.payload?.title ?? ""}
        inputText={(r) => r.payload?.title ?? ""}
        optionText={(r) => {
          return (
            <Box>
              <EventIcon type={r.type} style={{ marginRight: 10 }} />
              <EventTitle record={r} />
            </Box>
          );
        }}
      />
    </ReferenceInput>
  );
};

export default ReferenceEventInput;
