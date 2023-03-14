import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} label="Links" reference="links">
      <AutocompleteArrayInput
        source="id"
        optionText="title"
        translateChoice={false}
        fullWidth
        filterToQuery={(q: any) => ({ q })}
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayLinkInput;
