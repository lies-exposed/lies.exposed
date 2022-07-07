import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayLinkInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} label="Links" reference="links">
      <AutocompleteArrayInput
        source="id"
        label="title"
        optionText="title"
        translateChoice={false}
        matchSuggestion={(filter, suggestion) => {
          return (suggestion.title ?? suggestion.url ?? suggestion.id)
            .toLowerCase()
            .includes(filter.toLowerCase());
        }}
        fullWidth
        filterToQuery={(title: any) => ({ title })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayLinkInput;
