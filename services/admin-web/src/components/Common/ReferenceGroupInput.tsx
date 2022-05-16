import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "react-admin";

const ReferenceGroupInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="groups">
      <AutocompleteInput
        optionText="name"
        filterToQuery={(name) => ({ name })}
      />
    </ReferenceInput>
  );
};

export default ReferenceGroupInput;
