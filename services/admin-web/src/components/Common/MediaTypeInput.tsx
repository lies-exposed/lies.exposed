import { MediaType } from "@liexp/shared/io/http/Media";
import { SelectInput, SelectInputProps } from "ra-ui-materialui";
import * as React from "react";

export const MediaTypeInput: React.FC<Omit<SelectInputProps, "choices">> = (
  props
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
