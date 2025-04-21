import { EventSuggestionType } from "@liexp/shared/lib/io/http/EventSuggestion.js";
import * as React from "react";
import { SelectInput, type SelectInputProps } from "react-admin";

export const EventSuggestionTypeInput: React.FC<SelectInputProps> = (props) => {
  return (
    <SelectInput
      source="type"
      label="Suggestion Type"
      {...props}
      choices={EventSuggestionType.members.map((t) => ({
        id: t.literals[0],
        name: t.literals[0],
      }))}
    />
  );
};
