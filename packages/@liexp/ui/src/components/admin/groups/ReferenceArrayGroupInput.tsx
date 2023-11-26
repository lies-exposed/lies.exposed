import React from "react";
import { GroupChip } from "../../groups/GroupChip";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "../react-admin";

const ReferenceArrayGroupInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="groups">
      <AutocompleteArrayInput
        source="id"
        optionText={(g) => <GroupChip group={g} displayName />}
        filterToQuery={(name: any) => ({ name })}
        fullWidth
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupInput;
