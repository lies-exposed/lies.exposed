import { Keyword } from "@econnessione/shared/io/http";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import KeywordList, { KeywordListItem } from "../lists/KeywordList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteKeywordInputProps {
  className?: string;
  selectedItems: Keyword.Keyword[];
  onItemClick: (item: Keyword.Keyword[]) => void;
}

export const AutocompleteKeywordInput: React.FC<
  AutocompleteKeywordInputProps
> = ({ selectedItems, onItemClick, ...props }) => {
  return (
    <AutocompleteInput<Keyword.Keyword>
      placeholder="Keyword..."
      searchToFilter={(tag) => ({ tag })}
      selectedItems={selectedItems}
      getValue={(k) => k.tag}
      query={Queries.Keyword.getList}
      renderTags={(items) => (
        <KeywordList
          keywords={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(k) => onItemClick(items.filter((i) => i.id !== k.id))}
        />
      )}
      renderOption={(item, state) => (
        <KeywordListItem
          key={item.id}
          item={{
            ...item,
            selected: selectedItems.some((i) => i.id === item.id),
          }}
          onClick={() => {}}
        />
      )}
      onItemsChange={onItemClick}
      {...props}
    />
  );
};
