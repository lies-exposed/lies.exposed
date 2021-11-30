import {
  AutocompleteArrayInput,
  AutocompleteInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "ra-ui-materialui";
import React from "react";

const ReferenceArrayGroupInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      initialValue={[]}
      {...props}
      reference="groups"
      filterToQuery={(name: any) => ({ name })}
    >
      <AutocompleteArrayInput source="id" optionText="name" />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupInput;
