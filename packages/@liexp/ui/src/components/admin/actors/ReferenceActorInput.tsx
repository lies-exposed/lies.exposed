import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  type ReferenceInputProps,
} from "react-admin";
import { ActorChip } from "../../actors/ActorChip";

const ReferenceActorInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceInput {...props} reference="actors">
      <AutocompleteInput
        size="small"
        filterToQuery={(fullName) => ({ fullName })}
        optionText={(a) => (
          <ActorChip actor={a} displayFullName displayAvatar />
        )}
        inputText={(t) => t.fullName}
        fullWidth
      />
    </ReferenceInput>
  );
};

export default ReferenceActorInput;
