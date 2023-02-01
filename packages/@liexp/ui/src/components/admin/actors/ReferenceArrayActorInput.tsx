import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayActorInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="actors">
      <AutocompleteArrayInput
        fullWidth
        size="small"
        source="id"
        optionText="fullName"
        filterToQuery={(fullName: string) => ({ fullName })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayActorInput;
