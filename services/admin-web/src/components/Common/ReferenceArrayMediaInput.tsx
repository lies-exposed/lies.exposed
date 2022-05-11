import { Media, MediaType } from "@liexp/shared/io/http/Media";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";
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
      style={{
        ...props.style,
        width: '100%'
      }}
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
