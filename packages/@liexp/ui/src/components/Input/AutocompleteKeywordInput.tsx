import { type Keyword } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useQuery } from "react-query";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import KeywordList, { KeywordListItem } from "../lists/KeywordList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteKeywordInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Keyword.Keyword[];
  options?: Keyword.Keyword[];
  onChange: (item: Keyword.Keyword[]) => void;
}

export const AutocompleteKeywordInput: React.FC<
  AutocompleteKeywordInputProps
> = ({ discrete = true, selectedItems, onChange, options, ...props }) => {
  const Queries = useEndpointQueries();

  return (
    <AutocompleteInput<Keyword.Keyword>
      placeholder="Keyword..."
      searchToFilter={(search) => ({ search })}
      selectedItems={selectedItems}
      getValue={(k) => (typeof k === "string" ? k : k.tag)}
      query={(p) =>
        options
          ? useQuery(["keyword-options"], () =>
              Promise.resolve({ data: options }),
            )
          : Queries.Keyword.list.useQuery(p, undefined, discrete)
      }
      renderTags={(items) => (
        <KeywordList
          style={{
            maxWidth: "100%",
          }}
          keywords={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(k) => {
            onChange(items.filter((i) => i.id !== k.id));
          }}
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
            onClick={() => {
              onChange(
                selectedItems.filter((i) => i.id !== item.id).concat(item),
              );
            }}
          />
        );
      }}
      onItemsChange={onChange}
      {...props}
    />
  );
};
