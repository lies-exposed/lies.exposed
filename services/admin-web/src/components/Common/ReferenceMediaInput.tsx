import { Media, MediaType } from "@liexp/shared/io/http/Media";
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "ra-ui-materialui";
import React from "react";

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
      filterToQuery={(name) => ({ name })}
    >
      <AutocompleteInput
        source="id"
        optionText={(a: Partial<Media>) =>
          a?.id ? `${a.description}` : "No media"
        }
      />
    </ReferenceInput>
  );
};

export default ReferenceMediaInput;
