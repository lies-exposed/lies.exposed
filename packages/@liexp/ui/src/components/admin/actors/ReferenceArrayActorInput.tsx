import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";
import { ActorChip } from "../../actors/ActorChip.js";

const ReferenceArrayActorInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="actors">
      <AutocompleteArrayInput
        fullWidth
        size="small"
        source="id"
        optionText={(a) => <ActorChip actor={a} displayFullName />}
        filterToQuery={(search) => ({ search })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayActorInput;
