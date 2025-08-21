import * as React from "react";
import { GroupChip } from "../../groups/GroupChip.js";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "../react-admin.js";

const ReferenceArrayGroupInput: React.FC<
  Omit<ReferenceArrayInputProps, "children" | "reference"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="groups">
      <AutocompleteArrayInput
        source="id"
        optionText={(g) => <GroupChip group={g} displayName />}
        filterToQuery={(q) => ({ q })}
        fullWidth
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupInput;
