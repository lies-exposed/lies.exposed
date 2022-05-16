import { Actor } from "@liexp/shared/io/http/Actor";
import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayActorInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="actors">
      <AutocompleteArrayInput
        source="id"
        optionText={(a: Partial<Actor>) =>
          a?.id ? `${a.fullName}` : "No actor"
        }
        filterToQuery={(fullName: string) => ({ fullName })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayActorInput;
