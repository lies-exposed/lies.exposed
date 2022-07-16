import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "react-admin";

const ReferenceActorInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="actors">
      <AutocompleteInput
        size="small"
        optionText="fullName"
        filterToQuery={(fullName) => ({ fullName })}
        fullWidth
      />
    </ReferenceInput>
  );
};

export default ReferenceActorInput;
