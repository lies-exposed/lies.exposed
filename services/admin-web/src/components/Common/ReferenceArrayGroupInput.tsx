import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";
import React from "react";

const ReferenceArrayGroupInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="groups"
      filterToQuery={(name: any) => ({ name })}
    >
      <AutocompleteArrayInput source="id" optionText="name" />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupInput;
