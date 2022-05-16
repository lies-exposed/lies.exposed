import { Media, MediaType } from "@liexp/shared/io/http/Media";
import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";

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
        source="id"
        optionText={(a: Partial<Media>) =>
          a?.id ? `${a.description}` : "No media"
        }
        filterToQuery={(description: string) => ({
          description: description === "" ? undefined : description,
        })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayMediaInput;
