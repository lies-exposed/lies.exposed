import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
} from "react-admin";
import { Box } from "../../mui/index.js";

const ReferenceKeywordInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <Box>
      <ReferenceInput {...props} reference="keywords">
        <AutocompleteInput
          size="small"
          optionText="tag"
          filterToQuery={(search) => ({ search })}
        />
      </ReferenceInput>
    </Box>
  );
};

export default ReferenceKeywordInput;
