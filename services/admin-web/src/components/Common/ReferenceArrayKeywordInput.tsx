import { Box } from "@mui/material";
import {
  AutocompleteArrayInput,
  Link,
  ReferenceArrayInput,
  ReferenceInputProps,
} from "react-admin";
import React from "react";

const ReferenceArrayKeywordInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string; showAdd: boolean }
> = ({ showAdd, ...props }) => {
  return (
    <Box>
      <ReferenceArrayInput
        {...props}
        reference="keywords"
        filterToQuery={(search: string) => ({ search })}
      >
        <AutocompleteArrayInput optionText="tag" />
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
