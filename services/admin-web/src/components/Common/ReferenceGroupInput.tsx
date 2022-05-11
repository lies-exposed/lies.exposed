import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "react-admin";
import React from "react";

const ReferenceGroupInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput
      {...props}
      reference="groups"
      filterToQuery={(name) => ({ name })}
    >
      <AutocompleteInput optionText="name" />
    </ReferenceInput>
  );
};

export default ReferenceGroupInput;
