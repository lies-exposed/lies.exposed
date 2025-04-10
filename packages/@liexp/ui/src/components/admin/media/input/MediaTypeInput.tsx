import { MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import * as React from "react";
import { SelectInput, type SelectInputProps } from "../../react-admin.js";

export const MediaTypeInput: React.FC<Omit<SelectInputProps, "choices">> = (
  props,
) => {
  return (
    <SelectInput
      {...props}
      choices={MediaType.members.map((v) => ({
        id: v.literals[0],
        name: v.literals[0],
      }))}
    />
  );
};
