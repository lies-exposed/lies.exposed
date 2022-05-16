import { Media, MediaType } from "@liexp/shared/io/http/Media";
import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "react-admin";

const ReferenceMediaInput: React.FC<
  Omit<ReferenceInputProps, "children"> & {
    source: string;
    allowedTypes?: MediaType[];
  }
> = ({ allowedTypes, ...props }) => {
  return (
    <ReferenceInput
      {...props}
      reference="media"
      filter={{
        type: allowedTypes,
      }}
    >
      <AutocompleteInput
        source="id"
        optionText={(a: Partial<Media>) =>
          a?.id ? `${a.description}` : "No media"
        }
        filterToQuery={(name) => ({ name })}
      />
    </ReferenceInput>
  );
};

export default ReferenceMediaInput;
