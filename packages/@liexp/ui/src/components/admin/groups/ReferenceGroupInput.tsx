import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
} from "react-admin";
import { GroupChip } from "../../groups/GroupChip.js";

const ReferenceGroupInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="groups">
      <AutocompleteInput
        size="small"
        filterToQuery={(search) => ({ search })}
        optionText={(g) => <GroupChip group={g} displayName />}
        inputText={(t) => t.name}
      />
    </ReferenceInput>
  );
};

export default ReferenceGroupInput;
