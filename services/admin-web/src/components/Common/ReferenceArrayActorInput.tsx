import { Actor } from "@liexp/shared/io/http/Actor";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "ra-ui-materialui";
import React from "react";

const ReferenceArrayActorInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="actors"
      filterToQuery={(fullName: string) => ({ fullName })}
    >
      <AutocompleteArrayInput
        source="id"
        optionText={(a: Partial<Actor>) =>
          a?.id ? `${a.fullName}` : "No actor"
        }
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayActorInput;
