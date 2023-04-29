import { type Group } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useGroupsQuery } from "../../state/queries/groups.queries";
import GroupList, { GroupListItem } from "../lists/GroupList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Group.Group[];
  onChange: (item: Group.Group[]) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  ...props
}) => {
  return (
    <AutocompleteInput<Group.Group>
      placeholder="Groups..."
      getValue={(a) => (typeof a === "string" ? a : a.name)}
      searchToFilter={(name) => ({ name })}
      selectedItems={selectedItems}
      query={p => useGroupsQuery(p, discrete)}
      renderTags={(items) => (
        <GroupList
          groups={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(g) => { onChange(items.filter((i) => i.id !== g.id)); }}
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
            onChange(selectedItems.filter((i) => i.id !== item.id).concat(item))
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
