import {
  AutocompleteArrayInput,
  AutocompleteInput,
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
      <AutocompleteArrayInput source="id" optionText="title" />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayEventInput;
