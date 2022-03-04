import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceInputProps,
} from "ra-ui-materialui";
import React from "react";

const ReferenceArrayKeywordInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="keywords"
      filterToQuery={(search: string) => ({ search })}
    >
      <AutocompleteArrayInput optionText="tag" />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayKeywordInput;
