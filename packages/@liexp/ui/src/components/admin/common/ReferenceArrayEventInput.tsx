import { DEATH } from "@liexp/shared/io/http/Events/Death";
import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayEventInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="events">
      <AutocompleteArrayInput
        source="id"
        filterToQuery={(title: any) => ({ title })}
        fullWidth
        optionText={(r) => {
          switch (r.type) {
            case DEATH.value:
              return `${r.type}: ${r.payload.victim}`;
            default:
              return `${r.type}: ${r.payload.title}`;
          }
        }}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayEventInput;
