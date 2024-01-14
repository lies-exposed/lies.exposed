import { EventSuggestionStatus } from "@liexp/shared/lib/io/http/EventSuggestion.js";
import * as React from "react";
import { SelectInput, type SelectInputProps } from "react-admin";

export const EventSuggestionStatusInput: React.FC<SelectInputProps> = (
  props,
) => {
  return (
    <SelectInput
      label="Suggestion status"
      source="status"
      {...props}
      choices={EventSuggestionStatus.types.map((t) => ({
        id: t.value,
        name: t.value,
      }))}
    />
  );
};
