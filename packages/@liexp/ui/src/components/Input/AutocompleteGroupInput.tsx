import { type Group } from "@liexp/shared/lib/io/http/index.js";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import GroupList, { GroupListItem } from "../lists/GroupList.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

interface AutocompleteGroupInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Group.Group[];
  options?: Group.Group[];
  excludeIds?: string[];
  onChange: (item: Group.Group[]) => void;
  tabIndex?: number;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  options,
  excludeIds,
  ...props
}) => {
  const { Queries } = useEndpointQueries();
  return (
    <AutocompleteInput<Group.Group>
      placeholder="Groups..."
      getOptionLabel={(a) => (typeof a === "string" ? a : a.name)}
      searchToFilter={(q) => ({ q })}
      selectedItems={selectedItems}
      query={(p) =>
        options
          ? useQuery({
              // eslint-disable-next-line @tanstack/query/exhaustive-deps
              queryKey: ["group-options"],
              queryFn: () =>
                Promise.resolve({ data: options, total: options.length }),
            })
          : Queries.Group.list.useQuery(
              {
                filter: { ...p.filter, excludeIds },
              },
              undefined,
              discrete,
            )
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
