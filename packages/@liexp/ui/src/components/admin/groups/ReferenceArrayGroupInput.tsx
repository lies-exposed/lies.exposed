import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps
} from "react-admin";
import { GroupChip } from "../../groups/GroupChip";

const ReferenceArrayGroupInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="groups">
      <AutocompleteArrayInput
        source="id"
        optionText={(g) => <GroupChip group={g} />}
        filterToQuery={(name: any) => ({ name })}
        fullWidth
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupInput;
