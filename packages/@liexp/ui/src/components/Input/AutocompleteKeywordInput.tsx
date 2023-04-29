import { type Keyword } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useKeywordsQuery } from "../../state/queries/keywords.queries";
import KeywordList, { KeywordListItem } from "../lists/KeywordList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteKeywordInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Keyword.Keyword[];
  onChange: (item: Keyword.Keyword[]) => void;
}

export const AutocompleteKeywordInput: React.FC<
  AutocompleteKeywordInputProps
> = ({ discrete = true, selectedItems, onChange, ...props }) => {
  return (
    <AutocompleteInput<Keyword.Keyword>
      placeholder="Keyword..."
      searchToFilter={(search) => ({ search })}
      selectedItems={selectedItems}
      getValue={(k) => (typeof k === "string" ? k : k.tag)}
      query={p=> useKeywordsQuery(p, discrete)}
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
              selected: true,
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
