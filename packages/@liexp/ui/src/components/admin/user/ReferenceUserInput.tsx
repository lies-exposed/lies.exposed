import * as React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
} from "react-admin";

const ReferenceUserInput: React.FC<
  Omit<ReferenceInputProps, "children"> & {
    source: string;
    fullWidth?: boolean;
  }
> = ({ fullWidth, ...props }) => {
  return (
    <ReferenceInput {...props} reference="users">
      <AutocompleteInput
        size="small"
        fullWidth={fullWidth}
        optionText={(r) =>
          r ? `${r.firstName} ${r.lastName} (${r.username})` : undefined
        }
        filterToQuery={(username) => ({ username })}
      />
    </ReferenceInput>
  );
};

export default ReferenceUserInput;
