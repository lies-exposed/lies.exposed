import { string } from "fp-ts";
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "ra-ui-materialui";
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
