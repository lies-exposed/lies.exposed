import { type MediaType } from "@liexp/shared/lib/io/http/Media";
import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";
import {
  matchMediaSuggestions,
  MediaAutocompleteOptionText,
} from "../media/ReferenceMediaInput";

const ReferenceArrayMediaInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & {
    source: string;
    allowedTypes?: MediaType[];
  }
> = ({ allowedTypes, ...props }) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="media"
      filter={{
        type: allowedTypes,
      }}
      style={{
        ...props.style,
        width: "100%",
      }}
    >
      <AutocompleteArrayInput
        fullWidth
        source="id"
        optionText={<MediaAutocompleteOptionText />}
        matchSuggestion={matchMediaSuggestions}
        inputText={(r) => r.description}
        filterToQuery={(description: string) => ({
          description: description === "" ? undefined : description,
        })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayMediaInput;
