import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
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
        filterToQuery={(q) => ({ q })}
      />
    </ReferenceInput>
  );
};

export default ReferenceAreaInput;
