import { Media, MediaType } from "@liexp/shared/io/http/Media";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "ra-ui-materialui";
import React from "react";

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
      filterToQuery={(description: string) => ({
        description: description === "" ? undefined : description,
      })}
    >
      <AutocompleteArrayInput
        source="id"
        optionText={(a: Partial<Media>) =>
          a?.id ? `${a.description}` : "No media"
        }
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayMediaInput;
