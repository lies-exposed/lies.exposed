import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";
import { EventIcon } from "../../Common/Icons/index.js";
import { Box } from "../../mui/index.js";
import { EventTitle } from "./titles/EventTitle.js";

const ReferenceArrayEventInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      filter={{ withDrafts: true }}
      {...props}
      reference="events"
    >
      <AutocompleteArrayInput
        source="id"
        filterToQuery={(q) => ({ q })}
        fullWidth
        optionText={(r) => {
          return (
            <Box>
              <EventIcon type={r.type} style={{ marginRight: 10 }} />
              <EventTitle record={r} source="payload.title" />
            </Box>
          );
        }}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayEventInput;
