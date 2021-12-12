import { Keyword } from "@econnessione/shared/io/http";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import KeywordList, { KeywordListItem } from "../lists/KeywordList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteKeywordInputProps {
  selectedIds: string[];
  onItemClick: (item: Keyword.Keyword[]) => void;
}

export const AutocompleteKeywordInput: React.FC<
  AutocompleteKeywordInputProps
> = ({ selectedIds, onItemClick }) => {
  return (
    <AutocompleteInput<Keyword.Keyword>
      placeholder="Keyword..."
      searchToFilter={(tag) => ({ tag })}
      selectedIds={selectedIds}
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
            selected: selectedIds.includes(item.id),
          }}
          onClick={() => {}}
        />
      )}
      onItemsChange={onItemClick}
    />
  );
};
