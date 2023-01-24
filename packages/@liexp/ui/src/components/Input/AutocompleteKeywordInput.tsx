import { type Keyword } from "@liexp/shared/io/http";
import * as React from "react";
import { useKeywordsQuery } from "../../state/queries/DiscreteQueries";
import KeywordList, { KeywordListItem } from "../lists/KeywordList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteKeywordInputProps {
  className?: string;
  selectedItems: Keyword.Keyword[];
  onChange: (item: Keyword.Keyword[]) => void;
}

export const AutocompleteKeywordInput: React.FC<
  AutocompleteKeywordInputProps
> = ({ selectedItems, onChange, ...props }) => {
  return (
    <AutocompleteInput<Keyword.Keyword>
      placeholder="Keyword..."
      searchToFilter={(search) => ({ search })}
      selectedItems={selectedItems}
      getValue={(k) => (typeof k === "string" ? k : k.tag)}
      query={p=> useKeywordsQuery(p, true)}
      renderTags={(items) => (
        <KeywordList
          style={{
            maxWidth: "100%",
          }}
          keywords={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(k) => { onChange(items.filter((i) => i.id !== k.id)); }}
        />
      )}
      renderOption={(props, item, state) => {
        return (
          <KeywordListItem
            key={item.id}
            item={{
              ...item,
              selected: selectedItems.some((i) => i.id === item.id),
            }}
            onClick={() => { onChange([item]); }}
          />
        );
      }}
      onItemsChange={onChange}
      {...props}
    />
  );
};
