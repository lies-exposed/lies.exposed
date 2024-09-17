import { type MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import * as React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";
import {
  matchMediaSuggestions,
  MediaAutocompleteOptionText,
} from "./ReferenceMediaInput.js";

const ReferenceArrayMediaInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & {
    source: string;
    allowedTypes?: MediaType[];
    exclude?: string[];
  }
> = ({ allowedTypes, exclude = [], ...props }) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="media"
      filter={{
        type: allowedTypes,
        exclude,
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
        inputText={(r) => r.label ?? r.description}
        filterToQuery={(q) => ({
          q: q === "" ? undefined : q,
        })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayMediaInput;
