import { type Link } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import LinkCard from "../../components/Cards/LinkCard.js";
import { LinksList } from "../../components/lists/LinkList.js";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

export interface AutocompleteLinkInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Link.Link[];
  onChange: (items: Link.Link[]) => void;
}

export const AutocompleteLinkInput: React.FC<AutocompleteLinkInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  ...props
}) => {
  const { Queries } = useEndpointQueries();
  return (
    <AutocompleteInput<Link.Link>
      placeholder="Search in links..."
      getOptionLabel={(a) =>
        typeof a === "string"
          ? a
          : (a.description ?? a.title ?? "no description")
      }
      searchToFilter={(q) => ({ q })}
      selectedItems={selectedItems}
      query={(p) => Queries.Link.list.useQuery(p, undefined, discrete)}
      renderTags={(items) => (
        <LinksList
          links={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          style={{ flexWrap: "wrap", flexDirection: "row" }}
          onItemClick={(a: any) => {
            onChange(items.filter((i) => i.id !== a.id));
          }}
        />
      )}
      renderOption={(props, item, state) => (
        <LinkCard
          key={item.id}
          link={{
            ...item,
            selected: false,
          }}
          variant="horizontal"
          onClick={() => {
            onChange(
              selectedItems.filter((i) => i.id !== item.id).concat(item),
            );
          }}
          style={{
            height: 200,
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
