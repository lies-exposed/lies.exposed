import { MediaType } from "@liexp/shared/lib/io/http/Media";
import * as React from "react";
import { SelectInput, type SelectInputProps } from "../../react-admin";

export const MediaTypeInput: React.FC<Omit<SelectInputProps, "choices">> = (
  props,
) => {
  return (
    <SelectInput
      {...props}
      choices={MediaType.types.map((v) => ({
        id: v.value,
        name: v.value,
      }))}
    />
  );
};
