import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "ra-ui-materialui";
import React from "react";

const ReferenceArrayLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="links"
      filterToQuery={(description: any) => ({ description })}
    >
      <AutocompleteArrayInput source="id" optionText="description" />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayLinkInput;
