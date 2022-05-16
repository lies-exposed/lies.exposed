import { Box } from "@mui/material";
import React from "react";
import {
  AutocompleteArrayInput,
  Link,
  ReferenceArrayInput,
  ReferenceInputProps,
} from "react-admin";

const ReferenceArrayKeywordInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string; showAdd: boolean }
> = ({ showAdd, ...props }) => {
  return (
    <Box>
      <ReferenceArrayInput {...props} reference="keywords">
        <AutocompleteArrayInput
          optionText="tag"
          filterToQuery={(search: string) => ({ search })}
        />
      </ReferenceArrayInput>
      {showAdd ? (
        <Link to="/keywords" target="_blank">
          Add new keyword
        </Link>
      ) : null}
    </Box>
  );
};

export default ReferenceArrayKeywordInput;
