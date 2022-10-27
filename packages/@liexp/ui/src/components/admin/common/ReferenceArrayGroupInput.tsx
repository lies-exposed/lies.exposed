import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayGroupInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="groups">
      <AutocompleteArrayInput
        source="id"
        optionText="name"
        filterToQuery={(name: any) => ({ name })}
        fullWidth
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupInput;
