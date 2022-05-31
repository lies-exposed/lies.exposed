import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "react-admin";

const ReferenceAreaInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="areas">
      <AutocompleteInput
        fullWidth
        size="small"
        optionText="label"
        filterToQuery={(label) => ({ label })}
      />
    </ReferenceInput>
  );
};

export default ReferenceAreaInput;
