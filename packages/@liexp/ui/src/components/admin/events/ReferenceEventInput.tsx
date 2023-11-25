import React from "react";
import { EventIcon } from "../../Common/Icons";
import { Box } from "../../mui";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
} from "../react-admin";
import { EventTitle } from "./titles/EventTitle";

const ReferenceEventInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="events">
      <AutocompleteInput
        source="id"
        size='small'
        filterToQuery={(title: any) => ({ title })}
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
