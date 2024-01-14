import { EventSuggestionType } from "@liexp/shared/lib/io/http/EventSuggestion.js";
import * as React from "react";
import { SelectInput, type SelectInputProps } from "react-admin";

export const EventSuggestionTypeInput: React.FC<SelectInputProps> = (props) => {
  return (
    <SelectInput
      source="type"
      label="Suggestion Type"
      {...props}
      choices={EventSuggestionType.types.map((t) => ({
        id: t.value,
        name: t.value,
      }))}
    />
  );
};
