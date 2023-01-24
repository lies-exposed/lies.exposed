import React from "react";
import {
  AutocompleteArrayInput,
  type ReferenceArrayInputProps,
  ReferenceInput,
} from "react-admin";

const ReferenceLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="links">
      <AutocompleteArrayInput
        source="id"
        optionText="title"
        filterToQuery={(title: any) => ({ title })}
      />
    </ReferenceInput>
  );
};

export default ReferenceLinkInput;
