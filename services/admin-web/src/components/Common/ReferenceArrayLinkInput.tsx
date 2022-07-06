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
    <ReferenceArrayInput {...props} reference="links">
      <AutocompleteArrayInput
        source="id"
        label="title"
        translate="no"
        optionText={"title"}
        matchSuggestion={(filter, suggestion) => {
          return (suggestion.title ?? suggestion.url)
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
