import { getTitle } from "@liexp/shared/lib/helpers/event";
import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";
import { EventIcon } from "../../Common/Icons";
import { Box } from "../../mui";

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
              <EventIcon type={r.type} />
              {getTitle(r, {
                actors: [],
                groups: [],
                media: [],
                links: [],
                areas: [],
                groupsMembers: [],
                keywords: [],
              })}
            </Box>
          );
        }}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayEventInput;
