import { type Group } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useQuery } from "react-query";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import GroupList, { GroupListItem } from "../lists/GroupList.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

interface AutocompleteGroupInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Group.Group[];
  options?: Group.Group[];
  onChange: (item: Group.Group[]) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  options,
  ...props
}) => {
  const Queries = useEndpointQueries();
  return (
    <AutocompleteInput<Group.Group>
      placeholder="Groups..."
      getOptionLabel={(a) => (typeof a === "string" ? a : a.name)}
      searchToFilter={(name) => ({ name })}
      selectedItems={selectedItems}
      query={(p) =>
        options
          ? useQuery({
              queryKey: ["group-options"],
              queryFn: () => Promise.resolve({ data: options }),
            })
          : Queries.Group.list.useQuery(p, undefined, discrete)
      }
      renderTags={(items) => (
        <GroupList
          groups={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(g) => {
            onChange(items.filter((i) => i.id !== g.id));
          }}
        />
      )}
      renderOption={(props, item, state) => (
        <GroupListItem
          key={item.id}
          displayName
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
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
