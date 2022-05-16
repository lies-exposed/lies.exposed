import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="links">
      <AutocompleteArrayInput
        source="id"
        optionText="title"
        filterToQuery={(title: any) => ({ title })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayLinkInput;
