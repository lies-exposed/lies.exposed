import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";
import { EventIcon } from "../../Common/Icons";
import { Box } from "../../mui";
import { EventTitle } from "./titles/EventTitle";

const ReferenceArrayEventInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="events">
      <AutocompleteArrayInput
        source="id"
        filterToQuery={(title: any) => ({ title })}
        fullWidth
        optionText={(r) => {
          return (
            <Box>
              <EventIcon type={r.type} style={{ marginRight: 10 }} />
              <EventTitle record={r} />
            </Box>
          );
        }}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayEventInput;
