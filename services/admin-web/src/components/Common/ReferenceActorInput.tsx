import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "ra-ui-materialui";
import React from "react";

const ReferenceActorInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput
      {...props}
      reference="actors"
      filterToQuery={(fullName) => ({ fullName })}
    >
      <AutocompleteInput optionText="fullName" />
    </ReferenceInput>
  );
};

export default ReferenceActorInput;
