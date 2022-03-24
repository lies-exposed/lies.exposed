import {
  AutocompleteArrayInput,
  ReferenceArrayInputProps,
  ReferenceInput
} from "ra-ui-materialui";
import React from "react";

const ReferenceLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput
      {...props}
      reference="links"
      filterToQuery={(title: any) => ({ title })}
    >
      <AutocompleteArrayInput source="id" optionText="title" />
    </ReferenceInput>
  );
};

export default ReferenceLinkInput;
