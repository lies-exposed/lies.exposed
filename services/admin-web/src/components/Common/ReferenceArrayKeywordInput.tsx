import { Box } from "@material-ui/core";
import {
  AutocompleteArrayInput,
  Link,
  ReferenceArrayInput,
  ReferenceInputProps,
} from "ra-ui-materialui";
import React from "react";

const ReferenceArrayKeywordInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <Box>
      <ReferenceArrayInput
        {...props}
        reference="keywords"
        filterToQuery={(search: string) => ({ search })}
      >
        <AutocompleteArrayInput optionText="tag" />
      </ReferenceArrayInput>
      <Link to="/keywords" target="_blank">Add new keyword</Link>
    </Box>
  );
};

export default ReferenceArrayKeywordInput;
