import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps
} from "react-admin";

const ReferenceArrayActorInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="actors">
      <AutocompleteArrayInput
        fullWidth
        source="id"
        filterToQuery={(fullName: string) => ({ fullName })}
        optionText="fullName"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayActorInput;
