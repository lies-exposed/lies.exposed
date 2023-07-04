import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
} from "react-admin";
import { GroupChip } from '../../groups/GroupChip';

const ReferenceGroupInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="groups">
      <AutocompleteInput
        size="small"
        filterToQuery={(name) => ({ name })}
        optionText={(g) => <GroupChip group={g} displayName />}
      />
    </ReferenceInput>
  );
};

export default ReferenceGroupInput;
