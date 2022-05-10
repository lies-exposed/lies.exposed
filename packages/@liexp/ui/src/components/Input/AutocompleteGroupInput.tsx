import { Group } from "@liexp/shared/io/http";
import * as React from "react";
import { useGroupsDiscreteQuery } from "../../state/queries/DiscreteQueries";
import GroupList, { GroupListItem } from "../lists/GroupList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupInputProps {
  className?: string;
  selectedItems: Group.Group[];
  onChange: (item: Group.Group[]) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedItems,
  onChange,
  ...props
}) => {
  return (
    <AutocompleteInput<Group.Group>
      placeholder="Groups..."
      getValue={(a) => (typeof a === "string" ? a : a.name)}
      searchToFilter={(name) => ({ name })}
      selectedItems={selectedItems}
      query={useGroupsDiscreteQuery}
      renderTags={(items) => (
        <GroupList
          groups={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(g) => onChange(items.filter((i) => i.id !== g.id))}
        />
      )}
      renderOption={(props, item, state) => (
        <GroupListItem
          key={item.id}
          displayName
          item={{
            ...item,
            selected: selectedItems.some((i) => i.id === item.id),
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
