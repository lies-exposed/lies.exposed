import * as React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children" | "reference"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} label="Links" reference="links">
      <AutocompleteArrayInput
        source="id"
        optionText="title"
        translateChoice={false}
        fullWidth
        filterToQuery={(q) => ({ q })}
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayLinkInput;
