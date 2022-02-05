import { DEATH } from "@econnessione/shared/io/http/Events/Death";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "ra-ui-materialui";
import React from "react";

const ReferenceArrayEventInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="events"
      filterToQuery={(title: any) => ({ title })}
    >
      <AutocompleteArrayInput
        source="id"
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
