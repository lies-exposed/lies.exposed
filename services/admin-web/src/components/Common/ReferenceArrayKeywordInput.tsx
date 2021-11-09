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
      defaultValue={[]}
      {...props}
      reference="keywords"
      filterToQuery={(tag: string) => ({ tag })}
    >
      <AutocompleteArrayInput optionText="tag" />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayKeywordInput;
