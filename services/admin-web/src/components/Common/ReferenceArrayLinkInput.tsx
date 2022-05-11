import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";
import React from "react";

const ReferenceArrayLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="links"
      filterToQuery={(title: any) => ({ title })}
    >
      <AutocompleteArrayInput source="id" optionText="title" />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayLinkInput;
