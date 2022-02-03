import { Group } from "@econnessione/shared/io/http";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import GroupList, { GroupListItem } from "../lists/GroupList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupInputProps {
  selectedItems: Group.Group[];
  onChange: (item: Group.Group[]) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedItems,
  onChange,
}) => {
  return (
    <AutocompleteInput<Group.Group>
      placeholder="Groups..."
      getValue={(a) => a.name}
      searchToFilter={(name) => ({ name })}
      selectedItems={selectedItems}
      query={Queries.Group.getList}
      renderTags={(items) => (
        <GroupList
          groups={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onGroupClick={(g) => onChange(items.filter((i) => i.id !== g.id))}
        />
      )}
      renderOption={(item, state) => (
        <GroupListItem
          key={item.id}
          displayName
          item={{
            ...item,
            selected: selectedItems.some(i => i.id === item.id),
          }}
        />
      )}
      onItemsChange={onChange}
    />
  );
};
